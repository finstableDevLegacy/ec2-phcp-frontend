import { FiatType } from "./fiat.type";
import { OnChainDealerOrderType } from "./on-chain.type";
import { OrderType } from "./order.type";
import { PaymentMethodType } from "./payment-method.type";
import { UserType } from "./user.type";

export interface MatchOrderType {
  fiatUnit: string;
  chainId: string;
  orderIdOnChain: string;
  detail: string;
  paymentMethod?: PaymentMethodType;
  slipImageUrl: string;
  price: string;
  fiat?: FiatType;
  fiatSymbol: string;
  amountAvailable: number;
  user?: UserType;
  order?: OrderType;
  amount?: string;
  createdAt?: Date;
  updatedAt?: Date;
  id?: string;
  onChain?: OnChainDealerOrderType;
  fee?: number;
}
