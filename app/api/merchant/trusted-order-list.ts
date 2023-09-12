import { api } from "~/api/base-url";
import { GetBestRateContentType } from "~/type/cashier/fiat-purchase-type";

type TrustedOrderListType = {
  page?: string,
  limit?: string,
  amount?: string,
  fiatName?: string,
  tokenSymbol?: string,
  paymentMethodId?: string,
  chainId: string,
};

export const trustedOrderList = async ({ page="1", limit="10", fiatName="THB", tokenSymbol="BUSD", chainId="97", amount }: TrustedOrderListType) => {
  let url = `/withdraw/trusted-order-list?page=${page}&limit=${limit}&fiatName=${fiatName}&tokenSymbol=${tokenSymbol}&paymentMethodId=1&chainId=${chainId}`
  if (amount) {
    url += `&amount=${amount}`
  }
  const { data } = await api().get(url, {    
    headers: {
      "x-api-key": ENV.API_KEY || "",
    },
  });
  return data as GetBestRateContentType [];
}