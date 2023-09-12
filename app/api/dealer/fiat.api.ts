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

export const apiFiatList = async (token: string) => {
  return await apiWithToken(token).get("/fiats");
};
