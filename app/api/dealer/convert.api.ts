import axios from "axios";
import { Exchange } from "~/type/dealer/enum";

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

export const apiConvertPrice = async (
  token: string,
  from: string,
  to: string = "THB"
) => {
  const params = {
    from,
    to,
    cexs: Exchange.SATANGPRO,
  };
  return await apiWithToken(token).get("/converts", { params });
};
