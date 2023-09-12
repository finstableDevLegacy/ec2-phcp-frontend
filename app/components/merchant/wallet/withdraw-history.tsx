import { useState, useEffect } from "react";

import Table, { ColumnsProps } from "~/components/ui/Table/table";
import { WithdrawOrderStatus } from "~/enums/withdraw-order-status";
import Pagination from "~/components/ui/Pagination/pagination";
import { useAccount, useBalance } from "wagmi";
import { getWithdrawOrders } from "~/api/order";
import { delay } from "~/utils/delay";
import { formatNumber } from "~/utils/format";
import { shortenTxLink } from "~/utils/shorten"; // For txHash columns
import { encryptString } from "~/utils/crypto";
import { useNavigate } from "@remix-run/react";

type HistoryRecordType = {
  index: number,
  id: number,
  price: number,
  createdAt: string,
  status: WithdrawOrderStatus,
  withdrawOrder: any,
  transactionHash?: string,
};

type FetchDataType = {
  walletAddress: string;
  currentPage: number;
  itemPerPage: number;
};

const WithdrawHistory = () => {
  const navigator = useNavigate();
  const [{ data: accountData }] = useAccount();
  const [{ loading }] = useBalance({
    addressOrName: accountData?.address,
    formatUnits: "ether",
  });
  const managerAddress = accountData?.address!;

  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalItems: 0,
    itemPerPage: 10,
    walletAddress: "",
  });
  const [historyList, setHistoryList] = useState<any>([]);
  const columnsList: ColumnsProps[] = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "TxHash",
      dataIndex: "txHash",
      key: "txHash",
      render: (txHash: string) => (
        <div className="pointer-cursor font-bold text-white">
          <a href={txHash} target="_blank">
            {shortenTxLink(txHash)}
          </a>
        </div>
      ),
    }, // Amount with fee
    { title: "Cashout Amount", dataIndex: "amount", key: "amount" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Action",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId: string) => (
        <button
          className="h-8 w-16 rounded-full bg-primary-yellow text-sm font-normal text-white shadow-md"
          onClick={() => { handleView(orderId); }}
        >
          view
        </button>
      ),
    }
  ];

  const handleView = (id: string) => {
    const url = `orderId=${id}`;
    const encryptParams = encryptString(url);
    navigator(`/merchant/manager/order-withdraw/id?${encryptParams}`);
  };

  const fetchData = async ({
    currentPage,
    itemPerPage,
    walletAddress,
  }: FetchDataType) => {
    setIsLoading(true);
    try {
      if (walletAddress) {
        const { data: withdrawOrders } = await getWithdrawOrders({
          page: currentPage,
          limit: itemPerPage,
          merchantAddress: walletAddress,
        });
        await delay(500);
        const result = mappingHistory(withdrawOrders.items);
        setHistoryList(result);
        setMeta({
          ...meta,
          currentPage: currentPage,
          totalItems: withdrawOrders.meta.totalItems,
          walletAddress
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      throw error;
    }
  };
  const mappingHistory = (historyLists: HistoryRecordType[]) => {
    return historyLists.map((item, index) => {
      return {
        no: index + 1,
        id: item.withdrawOrder.id,
        amount: formatNumber(item.withdrawOrder.amount),
        date: new Date(item.withdrawOrder.createdAt).toLocaleString(),
        status: item.withdrawOrder.status,
        txHash: item.transactionHash,
        orderId: item.id,
      };
    });
  };

  const handleShowEntries = (entries: number) => {
    setMeta({ ...meta, itemPerPage: entries });
    setLimit(entries);
    fetchData({ ...meta, itemPerPage: entries });
  };
  const handlePagination = (page: number) => {
    fetchData({ ...meta, currentPage: page });
  };

  useEffect(() => {
    if (managerAddress) {
      setMeta({ ...meta, walletAddress: managerAddress });
      fetchData({
        currentPage: 1,
        itemPerPage: 10,
        walletAddress: managerAddress,
      });
    }
  }, [managerAddress, loading]);

  return (
    <>
      <Table
        columns={columnsList}
        dataSource={historyList}
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
    </>
  );
};

export default WithdrawHistory;