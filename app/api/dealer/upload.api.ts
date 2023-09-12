import axios from "axios";

const BASE_URL = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

const api = () =>
  axios.create({
    baseURL: BASE_URL,
  });

export const apiUploadImage = async (file: File) => {
  const bodyFormData = new FormData();
  bodyFormData.append("upload", file);
  return api().post("/upload-file", bodyFormData);
};
