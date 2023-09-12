import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import OrderSelect from "~/components/order-select";
import Table, { ColumnsProps } from "~/components/ui/Table/table";
import { getOrdersFilter } from "~/api/order";
import { shorten } from "~/utils/shorten";
import Pagination from "~/components/ui/Pagination/pagination";
import { OrderResponse } from "~/type/api-response";
import { formatNumber } from "~/utils/format";
import { encryptString } from "~/utils/crypto";
import Countdown from "~/components/countdown";
import { getCashierUser } from "~/utils/cashier-session.server";
import { MemberDetail } from "~/type/member";
import { isOrderPassDeadline } from "~/utils/order";
import { useAccount } from "wagmi";
import { PAYMENT_OUTPUT } from "~/constants/paymentOptions";

export type OrderType = "pending" | "history";

type LoaderData = {
  cashierData: MemberDetail | undefined;
};

const useMerchantOrders = (
  cashierData: MemberDetail | undefined,
  isCountDownFinish: boolean
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [{ data: accountData }] = useAccount();
  const [orders, setOrders] = useState<OrderResponse[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalItems: 0,
    itemPerPage: 10,
    walletAddress: "",
  });

  const managerAddress =
    cashierData?.managerData?.walletAddress || accountData?.address;
  useEffect(() => {
    fetchOrders();
  }, [managerAddress, isCountDownFinish]);

  const fetchOrders = async (
    orderType: OrderType = "pending",
    resetPage?: boolean
  ) => {
    try {
      setIsLoading(true);
      if (managerAddress) {
        let filterStatus =
          orderType === "pending"
            ? ["status", "pending"]
            : ["status", "success"];

        if (resetPage) {
          setLimit(10);
          setPage(1);
        }

        const resp = await getOrdersFilter(
          [["merchantAddress", managerAddress], filterStatus],
          {
            page,
            limit,
          }
        );

        if (resp.data?.data) {
          const result = mappingOrder(resp.data.data, orderType);
          setOrders(result);

          setMeta({
            ...meta,
            currentPage: resp.data.page,
            totalItems: resp.data.total,
          });
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const mappingOrder = (orders: OrderResponse[], orderType: OrderType) => {
    let mapResult = orders.reduce<OrderResponse[]>((acc, item) => {
      const isDeadline = isOrderPassDeadline(item.deadline);

      if (isDeadline && orderType === "pending") {
        return acc;
      }

      let content;
      if (item.content) {
        content = JSON.parse(item.content);
      }
      let price = `${formatNumber(content.receiveFiatValue)} ${
        content.currency
      }`;
      let receiveToken: string;
      if (item.paymentOutput === PAYMENT_OUTPUT.TOKEN) {
        receiveToken = `${formatNumber(content.receiveTokenValue)} ${
          content.receiveToken
        }`;
      } else {
        receiveToken = price;
      }

      let total;
      if (content.discount_percentage) {
        total = `${formatNumber(
          (Number(content.price) *
            (100 - Number(content.discount_percentage))) /
            100
        )}${content.currency}`;
      } else {
        total = `${formatNumber(content.receiveFiatValue)}${content.currency}`;
      }
      let tokenPrice = `${formatNumber(content.receiveTokenValue)} ${
        item.payToken
      }`;
      const fee = Number(item.fee);
      let feeCal = `${formatNumber((content.receiveFiatValue * fee) / 100)} ${
        content?.currency
      }`;

      let format = {
        ...item,
        id: item.id,
        txHash: item.transactionHash,
        createAt: new Date(item.createdAt).toLocaleString(),
        merchant: item.merchantAddress,
        merchantName: item.manager.name,
        price,
        total,
        feeCal,
        paid: tokenPrice,
        received: receiveToken,
        paymentOutput: item.paymentOutput,
        content,
        deadlineMS: Math.floor(
          new Date(item.deadline).getTime() / 1000
        ).toString(),
      };

      format.content = { ...format, ...content };

      acc.push(format);

      return acc;
    }, []);

    return mapResult;
  };

  return {
    isLoading,
    orders,
    setOrders,
    meta,
    limit,
    setLimit,
    page,
    setPage,
    fetchOrders,
  };
};

export let handle = {
  i18n: ["order"],
};

export const loader: LoaderFunction = async ({ request }) => {
  const cashierData = await getCashierUser(request);
  return {
    cashierData: cashierData?.user,
  };
};

export default function MerchantOrder() {
  const { cashierData } = useLoaderData<LoaderData>();

  const { t } = useTranslation("order");
  const [orderType, setOrderType] = useState<"pending" | "history">("pending");

  const navigator = useNavigate();
  const [isCountDownFinish, setIsCountDownFinish] = useState(false);
  const {
    isLoading,
    orders,
    setOrders,
    meta,
    limit,
    setLimit,
    page,
    setPage,
    fetchOrders,
  } = useMerchantOrders(cashierData, isCountDownFinish);

  const pendingColumnsList: ColumnsProps[] = [
    {
      title: t("order_id"),
      dataIndex: "id",
      key: "id",
      render: (id: string) => <p className="font-medium">{id}</p>,
    },
    { title: t("date"), dataIndex: "createAt", key: "createAt" },
    { title: t("product_price"), dataIndex: "price", key: "price" },
    {
      title: t("fee"),
      dataIndex: "feeCal",
      key: "feeCal",
    },
    {
      title: t("total"),
      dataIndex: "total",
      key: "total",
    },
    {
      title: t("receiving"),
      dataIndex: "received",
      key: "received",
      render: (received: string) => <>≈ {received}</>,
    },
    {
      title: t("remaining_time"),
      dataIndex: "deadlineMS",
      key: "deadlineMS",
      render: (deadline: string) => (
        <>
          <Countdown
            message=""
            deadline={deadline}
            isCountDownFinish={isCountDownFinish}
            setIsCountDownFinish={setIsCountDownFinish}
          />
        </>
      ),
    },
    {
      title: t("action"),
      dataIndex: "content",
      key: "content",
      render: (content: any) => (
        <button
          className="h-8 w-16 rounded-full bg-primary-yellow text-sm font-normal text-white shadow-pay-wallet"
          onClick={() => handlePendingView(content)}
        >
          {t("proceed")}
        </button>
      ),
    },
  ];

  const historyColumnsList: ColumnsProps[] = [
    {
      title: t("order_id"),
      dataIndex: "id",
      key: "id",
      render: (id: string) => <p className="font-medium"> {id}</p>,
    },
    {
      title: t("tx_hash"),
      dataIndex: "txHash",
      key: "txHash",
      render: (txHash: string) => (
        <div className="font-bold text-primary-yellow hover:text-secondary-green">
          <a href={txHash} target="_blank">
            {shorten(txHash.split(/.*tx\//)[1])}
          </a>
        </div>
      ),
    },
    { title: t("date"), dataIndex: "createAt", key: "createAt" },
    {
      title: t("product_price"),
      dataIndex: "price",
      key: "price",
    },
    {
      title: t("fee"),
      dataIndex: "feeCal",
      key: "feeCal",
      render: (feeCal) => <div className="">{feeCal}</div>,
    },
    {
      title: t("total"),
      dataIndex: "total",
      key: "total",
    },
    { title: t("received"), dataIndex: "received", key: "received" },
    {
      title: t("action"),
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <button
          className="h-8 w-16 rounded-full bg-primary-yellow text-sm font-normal text-white shadow-pay-wallet"
          onClick={() => handleView(id)}
        >
          {t("view")}
        </button>
      ),
    },
  ];

  const handleView = (id: string) => {
    const url = `orderId=${id}`;
    const encryptParams = encryptString(url);
    navigator(`/merchant/order/id?${encryptParams}`);
  };

  const handlePendingView = (content: any) => {
    const url = `orderId=${content.id}&price=${content.price}&receiveToken=${
      content.receiveToken
    }&receiveTokenValue=${content.receiveTokenValue}&exchangeRate=${
      content.exchangeRate
    }&currency=${content.currency}&merchant=${
      content.merchantAddress
    }&deadline=${Math.floor(new Date(content.deadline).getTime() / 1000)}
    &merchantName=${content.merchantName}
    &paymentOutput=${content.paymentOutput}
    &receiveFiatValue=${content.receiveFiatValue}
    &brokerFee=${content.brokerFee}
    &dealerFee=${content.dealerFee}`;

    const encryptParams = encryptString(url);
    navigator(`/merchant/order/neworder?${encryptParams}`);
  };

  useEffect(() => {
    fetchOrders(orderType);
  }, [limit, page, orderType, isCountDownFinish]);

  useEffect(() => {
    if (isCountDownFinish) {
      fetchOrders("pending");
    }
  }, [isCountDownFinish]);

  const onChangeOrderType = (e: OrderType) => {
    if (e !== orderType) {
      setOrders([]);
      fetchOrders(e, true);
    }
    setOrderType(e);
  };

  const onChangePageSize = (e: number) => {
    setLimit(e);
    setPage(1);
  };

  const onSelectPage = (e: number) => {
    setPage(e);
  };

  return (
    <div className="flex min-h-full w-full justify-center pt-5 pb-10 sm:pt-10">
      <div className="w-full">
        <p className="text-xl font-bold text-primary-yellow lg:ml-20 lg:text-4xl">
          {t("order_lists")}
        </p>
        <OrderSelect orderType={orderType} setOrderType={onChangeOrderType} />
        {orderType === "pending" ? (
          <div className="mx-auto mt-2 max-w-6xl">
            <Table
              columns={pendingColumnsList}
              dataSource={orders?.filter((item: OrderResponse) => item.platform && item.platform.platformName === "phcp")}
              onEntries={onChangePageSize}
              isLoading={isLoading}
            />
            <div className="mt-7 flex justify-end">
              <Pagination
                currentPage={meta.currentPage}
                totalItems={meta.totalItems}
                itemPerPage={limit}
                onPrev={onSelectPage}
                onNext={onSelectPage}
                onSelect={onSelectPage}
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-2 max-w-6xl">
            <Table
              columns={historyColumnsList}
              dataSource={orders?.filter((item: OrderResponse) => item.platform && item.platform.platformName === "phcp")}
              onEntries={onChangePageSize}
              isLoading={isLoading}
            />
            <div className="mt-7 flex justify-end">
              <Pagination
                currentPage={meta.currentPage}
                totalItems={meta.totalItems}
                itemPerPage={limit}
                onPrev={onSelectPage}
                onNext={onSelectPage}
                onSelect={onSelectPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
