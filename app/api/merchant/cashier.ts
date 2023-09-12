import STORAGE_KEYS from "~/constants/storage-key";
import localService from "~/services/localstorage";
import { apiWithToken } from "../base-url";

export const getManagerCashierData = async () => {
  const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const { data } = await apiWithToken(accessToken).get(
    `/managers/info/managercashierdata`
  );
  return data as {
    id: string;
  };
};
