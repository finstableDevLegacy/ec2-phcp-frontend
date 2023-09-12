import { GetBankProfileResponse } from "~/type/bankprofile";
import { api, apiWithToken } from "../base-url";

export const getBankProfile: (
  token: string
) => Promise<GetBankProfileResponse> = async (token: string) => {
  const { data } = await apiWithToken(token).get(`/dealer/bankaccount`);
  return data;
};

export const getBankProfileByCashier = async (
  cashierId: string
) => {
  const { data } = await api().get(
    `/managers/bankaccountbycashier/${cashierId}`
  );
  const bank = data as GetBankProfileResponse;
  return bank;
};

export const updateBankProfile: (
  token: string,
  bankAccountNumber: string,
  name: string,
  bankName: string
) => Promise<{}> = async (
  token: string,
  bankAccountNumber: string,
  name: string,
  bankName: string
) => {
  await apiWithToken(token).put(`/dealer/bankaccount`, {
    bankAccountNumber,
    name,
    bankName,
  });
  return {};
};
