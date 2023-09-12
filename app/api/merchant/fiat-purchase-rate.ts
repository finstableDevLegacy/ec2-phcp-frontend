import { GetFiatPurchaseRateResponse } from "~/type/cashier/fiat-purchase-type";
import { api } from "../base-url";

export const getFiatPurchaseRate = async (
  amount: number,
  chainId: string,
  fiatName: string,
  tokenSymbol: string,
) => {
  const { data } = await api().get(`/fiat-purchase/info/bestrate`, {
    params: {
      amount: amount.toFixed(2),
      chainId,
      fiatName,
      tokenSymbol,
    },
  });
  return data as GetFiatPurchaseRateResponse;
};

export const getFiatRate = async (
  tokenPair: string,
  fiatPair: string,
  chainId: string,
) => {
  const { data } = await api().get(`/fiat-purchase/fiat-rate?pair=${tokenPair}_${fiatPair}&chainId=${chainId}`)
  return data as string;
}