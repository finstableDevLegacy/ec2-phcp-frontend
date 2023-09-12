import axios from "axios";
import { ManagerData, PaymentOption } from "~/type/manager";

const TRANSCRYPT_BACKEND = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

export const apiWithToken = (token: string) => {
  return axios.create({
    baseURL: TRANSCRYPT_BACKEND,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const api = () =>
  axios.create({
    baseURL: TRANSCRYPT_BACKEND,
  });

export const getManagerData = async (walletAddress: string) => {
  try {
    const resp = await fetch(
      `${TRANSCRYPT_BACKEND}/managers?filter=walletAddress||$eq||${walletAddress.toLowerCase()}`
    );
    const result = await resp.json();
    return result[0] as ManagerData | undefined;
  } catch (error) {
    throw error;
  }
};

export const getManagerDataById = async (managerId: string) => {
  try {
    const resp = await fetch(
      `${TRANSCRYPT_BACKEND}/managers?filter=id||$eq||${managerId}`
    );
    const result = await resp.json();
    return result[0] as ManagerData | undefined;
  } catch (error) {
    throw error;
  }
};

export const getPayment = async () => {
  try {
    const resp = await api().get(`${TRANSCRYPT_BACKEND}/payment/getPayment`);
    const result = await resp.data;

    return result as PaymentOption[] | undefined;
  } catch (error) {
    throw error;
  }
};

export const getPaymentByManager = async (token: string) => {
  try {
    const resp = await apiWithToken(token).get(
      `${TRANSCRYPT_BACKEND}/managers/getPaymentByManager`
    );
    const result = await resp.data;

    return result as
      | {
          payments: PaymentOption[];
          defaultPayment: PaymentOption;
        }
      | undefined;
  } catch (error) {
    throw error;
  }
};

export const updatePayment: (
  token: string,
  defaultPaymentId: string,
  option: string[]
) => Promise<{}> = async (
  token: string,
  defaultPaymentId: string,
  option: string[]
) => {
  await apiWithToken(token).put(`/managers/updatePayment`, {
    token,
    defaultPaymentId,
    option,
  });
  return {};
};

export const getOrderFiatById = async (id: string) => {
  const resp = await api().get(`/managers/info/fiatorder/${id}`);
  return resp.data.slipImageUrl;
};
