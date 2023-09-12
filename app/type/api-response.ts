import { ManagerData } from "./manager";
import { PlatformData } from "./platform";

export type OrderResponse = {
  id: number;
  amountOut: number;
  content: string;
  deadline: string;
  fee: string;
  merchantAddress: string;
  payAmount: number;
  payToken: string;
  payerAddress: string;
  tokenSymbol: string;
  transactionHash: string;
  paymentOutput: string;
  status: "pending" | "success" | "failed" | "cancelled" | "expired";
  createdAt: Date;
  updatedAt: Date;
  chashier: string;
  manager: ManagerData;
  discount_percentage: string;
  platform: PlatformData;
  withdrawOrder: any;
};

export type TokenResponse = {
  id: string;
  address: string;
  symbol: string;
  network: string;
  networkId: number;
  decimals: number;
  description: string | null;
  logoPath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderFiatResponse = {
  id: number;
  txHash: string;
  paymentOutput: string;
  chashier: string;
  paid: string;
  createdAt: Date;
  updatedAt: Date;
};
