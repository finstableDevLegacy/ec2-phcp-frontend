import axios from "axios";
import { ethers } from "ethers";
import { OrderResponse } from "~/type/api-response";

const TRANSCRYPT_BACKEND = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

const nonValue = ['isnull', 'notnull'];

export const api = () =>
  axios.create({
    baseURL: TRANSCRYPT_BACKEND,
  });

export const getOrders = ({ page = 1, limit = 10 }) => {
  return api().get(`/orders?page=${page}&limit=${limit}`);
};

export const getOrder = (
  address: string,
  type: "payerAddress" | "merchantAddress",
  status?: string
) => {
  return api().get(
    `/orders?filter=${type}||$eqL||${address.toLowerCase()}${status ? "&filter=status||$eq||" + status : ""
    }`
  );
};

// filter parameter -  [ ["id", "4"], ["status", "completed"] ]
export const getOrderFilter = async (filters: string[][]) => {
  const filterParams = filters.reduce((acc, cur, index) => {
    let [filterBy, value] = cur;

    // address in db is saved as lowercase
    if (filterBy.includes("Address")) {
      value = value.toLowerCase();
    }
    const moreFilter = index === filters.length - 1 ? "" : "&filter=";
    acc = acc.concat(filterBy + "||$eq||" + value + moreFilter);
    return acc;
  }, "?filter=");

  const resp = await api().get(`/orders${filterParams}`);

  return resp.data[0] as OrderResponse;
};

export const getOrdersFilter = async (
  filters: string[][],
  { page = 1, limit = 10 }
) => {
  const filterParams = filters.reduce((acc, cur, index) => {
    let [filterBy, value, condition] = cur;

    let onCondition = condition ? condition : "$eq";

    // address in db is saved as lowercase
    if (filterBy.includes("Address")) {
      value = value.toLowerCase();
    }

    const moreFilter = index === filters.length - 1 ? "" : "&filter=";
    if (nonValue.includes(onCondition)) {
      acc = acc.concat(filterBy + `||${onCondition}` + moreFilter);
    } else {
      acc = acc.concat(filterBy + `||${onCondition}||` + value + moreFilter);
    }
    return acc;
  }, "?filter=");
  const resp = await api().get(
    `/orders${filterParams}&page=${page}&limit=${limit}&sort=createdAt,DESC`
  );

  return resp;
};

export const createOrder = (data: {
  merchantAddress: string;
  amountOut: number;
  tokenSymbol: string;
  networkId: string;
  fee: string;
  content: string;
  managerId: string;
  paymentOutput: string;
  platformType: string
}) => {
  const requestData = {
    ...data,
    merchantAddress: data.merchantAddress.toLowerCase()
  };
  return api().post(`/orders`, requestData);
};

export const updateContentDiscountPercentage = async (
  id: string,
  discountPercentage: string
) => {
  const data = { id, discount_percentage: discountPercentage };

  await api().put(`/orders/update/content-discount-percentage`, data);
};

export const listOrderFiat = async () => {
  const resp = await api().get(`/orders/list/orderfiat`);
  return resp.data;
};

export const getTxHash = async (data: ethers.Event) => {
  const receiptData = { ...data }
  return await api().post(`/orders/decodeReceiptEvent`, receiptData);
};

export const getTxHashFiat = async (data: ethers.Event) => {
  const receiptData = { ...data };
  return await api().post(`/orders/decodeReceiptEventFiat`, receiptData);
};

export const createWithdrawOrder = (data: {
  merchantAddress: string;
  amountOut: number;
  tokenSymbol: string;
  networkId: string;
  fee?: string;
  managerId?: string;
  content: string;
  paymentOutput: string;
  platformType: string;
  detail: string;
}) => {
  const requestData = {
    ...data,
    merchantAddress: data.merchantAddress.toLocaleLowerCase()
  };
  return api().post('/withdraw/orderWithdraw', requestData);
};

export const saveWithdrawOrder = (data: {
  txHash: string;
  orderId: string;
  withdrawId: string;
  chainId: string;
  price: string;
}) => {
  return api().post('/withdraw/orderWithdraw3rdparty', { data }, {
    headers: {
      "x-api-key": ENV.API_KEY || "",
    },
  });
};

export const getWithdrawOrders = async ({ page = 1, limit = 10, merchantAddress = "" }: {
  page?: number;
  limit?: number;
  merchantAddress?: string;
}) => {
  return api().get(`/withdraw?page=${page}&limit=${limit}&merchantAddress=${merchantAddress.toLowerCase()}`);
}

export const failWithdrawOrder = async (orderId: string) => {
  return api().post(`/withdraw/del`, {
    orderId,
  });
}