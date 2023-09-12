import axios from "axios";

const BASE_URL = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

export const api = () =>
  axios.create({
    baseURL: BASE_URL,
  });

export const apiWithToken = (token?: string) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const apiTokensList = async (token: string, chainId: number) => {
  const params = {
    chainId,
  };
  return await apiWithToken(token).get("/tokens", { params });
};
