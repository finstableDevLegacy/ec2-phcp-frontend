import axios from "axios";
import { MatchOrderStatus } from "~/type/dealer/enum";
import { apiCreateMatchOrderResponse } from "~/type/match-order-api.type";
import { apiWithToken } from "../base-url";

export const apiMyMatchOrder = async (
  token: string,
  limit: number,
  page: number,
  status: MatchOrderStatus
) => {
  const url = "/match-order";
  const params = {
    limit,
    page,
    isMyorder: true,
    status,
  };
  return await apiWithToken(token).get(url, { params });
};

export const apiGetMatchOrderById = async (token: string, id: string) => {
  const url = "/match-order";
  return await apiWithToken(token).get(`${url}/${id}`);
};

export const apiConfirmPayTrustedOrder = async (
  token: string,
  id: string,
  slipImageUrl: string,
  orderIdOnChain: string
) => {
  const url = "/match-order/confirmpaytrustedorder";
  return await apiWithToken(token).patch(`${url}/${id}`, {
    slipImageUrl,
    orderIdOnChain,
  });
};

export const apiCreateMatchOrder = async (
  txHash: string,
  orderId: string,
  chainId: number
): Promise<apiCreateMatchOrderResponse> => {
  const url = "/fiat-purchase/info/matchorder";
  const { data } = await apiWithToken().post(url, {
    txHash,
    orderId,
    chainId,
  });
  return data;
};
