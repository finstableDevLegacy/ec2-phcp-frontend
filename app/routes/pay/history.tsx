import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { useTranslation } from "react-i18next";

import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { ColumnsProps } from "~/components/ui/Table/table";

import { getOrdersFilter } from "~/api/order";

import { shortenTxLink } from "~/utils/shorten";
import { OrderResponse } from "~/type/api-response";
import { encryptString } from "~/utils/crypto";
import { formatNumber } from "~/utils/format";

type FetchOrderForm = {
  walletAddress: string;
  currentPage: number;
  itemPerPage: number;
};

export let handle = {
  i18n: ["history"],
};

export default function History() {
  const { t } = useTranslation("history");

  const navigator = useNavigate();
  const [{ data: accountData }] = useAccount();
  const [{ loading }] = useBalance({
    addressOrName: accountData?.address,
    formatUnits: "ether",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [orderList, setOrderList] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalItems: 0,
    itemPerPage: 10,
    walletAddress: "",
  });

  useEffect(() => {
    if (accountData) {
      setMeta({ ...meta, walletAddress: accountData.address });
      fetchOrders({
        currentPage: 1,
        itemPerPage: 10,
        walletAddress: accountData.address,
      });
    }
  }, [loading]);

  const columnsList: ColumnsProps[] = [
    {
      title: t("order_id"),
      titleClass: "hidden md:table-cell",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: t("transaction"),
      titleClass: "hidden md:table-cell",
      dataIndex: "txHash",
      key: "txHash",
      render: (txHash: string) => (
        <div className="font-bold text-white hover:text-secondary-light-blue">
          <a href={txHash} target="_blank">
            {shortenTxLink(txHash)}
          </a>
        </div>
      ),
    },
    {
      title: t("date"),
      titleClass: "hidden md:table-cell",
      dataIndex: "createAt",
      key: "createAt",
    },
    {
      title: t("merchant"),
      titleClass: "hidden md:table-cell",
      dataIndex: "merchantName",
      key: "merchantName",
      render: (merchantName: string) => (
        <div className="font-bold text-white">{merchantName}</div>
      ),
    },
    {
      title: t("product_price"),
      dataIndex: "productPrice",
      key: "productPrice",
    },
    {
      title: t("paid"),
      dataIndex: `paid_custom`,
      key: "paid",
      render: (paid_custom) => <div className="">{paid_custom}</div>,
    },
    {
      title: t("Action"),
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <button
          className="hover:bg-sprimary-yellow rounded-full bg-primary-yellow px-2 py-1 text-sm font-medium text-white shadow-md md:px-3 md:py-2"
          onClick={() => handleView(id)}
        >
          {t("view")}
        </button>
      ),
    },
  ];

  const fetchOrders = async ({
    currentPage,
    itemPerPage,
    walletAddress,
  }: FetchOrderForm) => {
    const data = await getOrdersFilter([["payerAddress", walletAddress], ["withdrawOrder.id","","isnull"]], {
      page: currentPage,
      limit: itemPerPage,
    });

    const result = mappingOrder(data.data.data);
    // setOrderList({...result, customColumn: `${result.payAmount} ${result.payToken}`});
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

      const contentJSON = JSON.parse(item.content);
      let productPrice;
      if (contentJSON.discount_percentage) {
        productPrice = `${formatNumber(
          (content.price * (100 - contentJSON.discount_percentage)) / 100
        )} ${content.currency}`;
      } else {
        productPrice = `${formatNumber(content.receiveFiatValue)}${
          content.currency
        }`;
      }

      return {
        id: item.id,
        txHash: item.transactionHash,
        createAt: new Date(item.updatedAt).toLocaleString(),
        merchant: item.merchantAddress,
        merchantName: item.manager.name,
        payAmount: item.payAmount,
        productPrice,
        orderId: item.id,
        payToken: item.payToken,
        price: content
          ? `${formatNumber(content.price)} ${content.currency}`
          : "",
        paid: content
          ? `${formatNumber(content.receiveTokenValue)} ${content.receiveToken}`
          : "",
      };
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
    navigator(`/pay/order/id?${encryptParams}`);
  };

  return (
    <div className="mx-auto mt-10 max-w-6xl">
      <p className="mb-4 text-xl font-bold text-primary-yellow lg:ml-20 lg:text-4xl">
        {t("order_history")}
      </p>
      <Table
        columns={columnsList}
        dataSource={orderList}
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
