import { PaymentOutput } from "~/enums/payment-output";
import { GetPaymentOptionResponse } from "~/type/payment-option.type";
import { apiWithToken } from "../dealer/convert.api";
import { api } from "../base-url";

export const getMyPaymentOptions = async (cashierId: string) => {
  const { data } = await api().get(
    `/managers/paymentoptioncashier/${cashierId}`
  );
  const payments = data as GetPaymentOptionResponse;
  return payments;
};

export const getMyDefaultPaymentOption = async (token: string) => {
  return {
    id: "1",
    name: PaymentOutput.TOKEN,
  };
};
