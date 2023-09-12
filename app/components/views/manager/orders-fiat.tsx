import { Link, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { useTranslation } from "react-i18next";
import { Pagination } from "~/components/ui/Pagination";
import { getOrdersFilter } from "~/api/order";
import { shortenTxLink } from "~/utils/shorten";
import TableFait, { ColumnsProps } from "~/components/ui/Table/table-fait";
import { OrderResponse } from "~/type/api-response";
import { formatNumber } from "~/utils/format";
import { encryptString } from "~/utils/crypto";

type FetchOrderForm = {
  walletAddress: string;
  currentPage: number;
  itemPerPage: number;
};

export default function OrdersFiat() {
  const { t } = useTranslation("order");

  const navigator = useNavigate();
  const [{ data: accountData }] = useAccount();
  const [{ loading }] = useBalance({
    addressOrName: accountData?.address,
    formatUnits: "ether",
  });
  const managerAddress = accountData?.address!;

  const [isLoading, setIsLoading] = useState(false);
  const [orderList, setOrderList] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalItems: 0,
    itemPerPage: 10,
    walletAddress: "",
  });

  const columnsList: ColumnsProps[] = [
    { title: t("order"), dataIndex: "id", key: "id" },
    {
      title: t("tx_hash"),
      dataIndex: "txHash",
      key: "txHash",
      render: (txHash: string) => (
        <div className="pointer-cursor font-bold text-white">
          <a href={txHash} target="_blank">
            {shortenTxLink(txHash)}
          </a>
        </div>
      ),
    },
    { title: t("date"), dataIndex: "createAt", key: "createAt" },
    {
      title: t("merchant"),
      dataIndex: "merchantName",
      key: "merchantName",
      render: (merchantName: string) => (
        <div className="font-bold text-primary-yellow">{merchantName}</div>
      ),
    },
    {
      title: t("product_price"),
      dataIndex: "productPrice",
      key: "productPrice",
    },
    { title: t("fee"), dataIndex: "fee", key: "fee" },
    { title: t("total"), dataIndex: "total", key: "total" },
    {
      title: t("action"),
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <button
          className="h-8 w-16 rounded-full bg-primary-yellow text-sm font-normal text-white shadow-md"
          onClick={() => handleView(id)}
        >
          {t("view")}
        </button>
      ),
    },
  ];

  useEffect(() => {
    if (managerAddress) {
      setMeta({ ...meta, walletAddress: managerAddress });
      fetchOrders({
        currentPage: 1,
        itemPerPage: 10,
        walletAddress: managerAddress,
      });
    }
  }, [loading]);

  const fetchOrders = async ({
    currentPage,
    itemPerPage,
    walletAddress,
  }: FetchOrderForm) => {
    const data = await getOrdersFilter(
      [
        ["merchantAddress", walletAddress],
        ["status", "success"],
        ["paymentOutput", "Fiat"],
      ],
      {
        page: currentPage,
        limit: itemPerPage,
      }
    );
    const result = await mappingOrder(data.data.data);
    setOrderList(
      result.map((r) => {
        return {
          ...r,
          paid_custom: `${formatNumber(r.payAmount)} ${r.payToken}`,
        };
      })
    );
    setMeta({
      ...meta,
      currentPage: data.data.page,
      totalItems: data.data.total,
    });
  };

  const mappingOrder = (orders: OrderResponse[]) => {
    return orders.map((item) => {
      let content;
      if (item.content) {
        content = JSON.parse(item.content);
      }
      let price = `${formatNumber(content.receiveFiatValue)} ${content.currency
        }`;
      let receiveToken = `${formatNumber(content.receiveTokenValue)} ${content.receiveToken
        }`;
      // let total = `${formatNumber(content.price)} ${content.currency}`;
      const fee = Number(item.fee);
      let feeCal = `${formatNumber((content.receiveFiatValue * fee) / 100)} ${content?.currency
        }`;
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

      let format = {
        ...item,
        id: item.id,
        txHash: item.transactionHash,
        createAt: new Date(item.createdAt).toLocaleString(),
        merchant: item.merchantAddress,
        merchantName: item.manager.name,
        productPrice: price,
        total,
        fee: feeCal,
        received: receiveToken,
        paymentOutput: item.paymentOutput,
        content,
        deadlineMS: Math.floor(
          new Date(item.deadline).getTime() / 1000
        ).toString(),
      };
      return format;
    });
  };

  const handlePagination = (page: number) => {
    fetchOrders({ ...meta, currentPage: page });
  };

  const handleShowEntries = (entries: number) => {
    setMeta({ ...meta, itemPerPage: entries });
    setLimit(entries);
    fetchOrders({ ...meta, itemPerPage: entries });
  };

  const handleView = (id: string) => {
    const url = `orderId=${id}`;
    const encryptParams = encryptString(url);
    navigator(`/merchant/manager/order-fiat/id?${encryptParams}`);
  };

  return (
    <div className="mx-auto my-28 max-w-7xl">
      <p className="mb-3 text-2xl font-bold text-primary-yellow lg:text-3xl">
        {t("order_history")}
      </p>
      <div className="my-7 flex h-5 items-center justify-center rounded-full">
        <div
          className={`} cursor-pointer  rounded-l-full bg-gray-300 p-1.5  px-4 font-medium
        text-black`}
        >
          <Link to="/merchant/manager/orders/token"> {t("token")} </Link>
        </div>
        <div
          className={`cursor-pointer  rounded-r-full bg-primary-yellow p-1.5 px-4 font-medium
        text-white`}
        >
          <Link to="/merchant/manager/orders/fiat"> {t("fiat")}</Link>
        </div>
      </div>
      <TableFait
        columns={columnsList}
        dataSource={orderList?.filter(
          (item: OrderResponse) =>
            item.platform && item.platform.platformName === "phcp"
        )}
        onEntries={handleShowEntries}
        isLoading={isLoading}
      />
      <div className="mt-7 flex justify-end">
        <Pagination
          currentPage={meta.currentPage}
          totalItems={meta.totalItems}
          itemPerPage={limit}
          onPrev={handlePagination}
          onNext={handlePagination}
          onSelect={handlePagination}
        />
      </div>
    </div>
  );
}
