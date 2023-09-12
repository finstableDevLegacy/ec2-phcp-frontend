import axios from "axios";

const BASE_URL = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

const api = () =>
  axios.create({
    baseURL: BASE_URL,
  });

const apiWithToken = (token?: string) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const apiCreateBuyOrder = (
  token: string,
  price: number,
  priceFloor: number,
  priceCeiling: number,
  amountAvailable: number,
  chainId: number,
  type: string,
  tokenId: string,
  fiatId: string,
  paymentMethodId: string
) => {
  return apiWithToken(token).post("/orders", {
    price,
    priceFloor,
    priceCeiling,
    amountAvailable,
    chainId,
    type,
    tokenId,
    fiatId,
    paymentMethodId,
  });
};

export const apiGetMyOrder = (
  token: string,
  limit: number,
  page: number,
  chainId: number
) => {
  const url = "orders";
  const params = {
    limit,
    page,
    isMyorder: true,
    chainId,
  };
  return apiWithToken(token).get(url, { params });
};

export const apiGetBestMatch = (tokenSymbol: string, amount: string) => {
  const url = "orders/best-match";
  const params = {
    tokenSymbol,
    amount,
  };
  return api().get(url, { params });
};

export const apiUpdateOrderFiatPurchase = (
  orderId: string,
  fiatPurchaseId: string,
  fiatPurchasePrice: string,
  token: string
) => {
  return apiWithToken(token).put(
    `/orders/info/updateorderdealerfiatrateid/${orderId}`,
    {
      fiatPurchaseId,
      fiatPurchasePrice,
    }
  );
};
