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

export const apiGetChallengeDealer = () => {
  return api().get("/users/challenge");
};

export const apiLoginDealer = (signature: string) => {
  return api().post("/users/login/dealer", {
    signature,
  });
};
