import { PaymentOutput } from "~/enums/payment-output";

export type GetPaymentOptionResponse = PaymentOptionResponse[];

export type GetDefaultPaymentOptionResponse = PaymentOptionResponse;

export type PaymentOptionResponse = {
  id: string;
  name: PaymentOutput;
  isSelected: boolean;
  isDefault: boolean;
};
