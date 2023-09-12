import { PaymentOutput } from "~/enums/payment-output";
import { ManagerData } from "./manager";

export type OrderID = {
  orderId: string;
};

export type TTokenBalance = {
  name: string;
  addr: string;
  balance: string;
  isApproved: boolean;
  amountIn: string;
  rate: string;
};

export type MerchantOrder = {
  orderId: string;
  price: string;
  status: string;
  receiveToken: string;
  receiveTokenValue: string;
  exchangeRate: string;
  currency: string;
  merchant: string;
  deadline: string;
  receiveFiatValue: string;
  merchantName: string;
  fee: string;
  networkId: string;
  payAmount?: string;
  payToken?: string;
  paymentOutput?: PaymentOutput;
  payerAddress?: string;
  transactionHash?: string;
  updatedAt?: Date;
  manager?: ManagerData;
  discount_percentage: string;
  amountOut: Number;
  withdrawOrder?: any;
};

export type WithdrawOrder = {
  createdAt: string; 
  detail: string;
  id: number
  isActive: boolean;
  merchantAddress: string;
  price: string;
  status: string;
  updatedAt: string;
}

export type OrderState =
  | "idle"
  | "pending"
  | "success"
  | "failed"
  | "expired"
  | "dealer_complete";

export enum OrderStatus {
  IDLE = "idle",
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  EXPIRED = "expired",
  DEALER_COMPLETE = "dealer_complete"
}
