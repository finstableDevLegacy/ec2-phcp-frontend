import { FiatType } from "./fiat.type";
import { PaymentMethodType } from "./payment-method.type";
import { TokenType } from "../token";
import { UserType } from "./user.type";

export type OrderType = {
  id: string;
  amountAvailable: number;
  total: number;
  chainId: number;
  detail: string;
  price: number;
  priceCeiling: string;
  priceFloor: string;
  type: string;
  fiat: FiatType;
  paymentMethod: PaymentMethodType;
  token: TokenType;
  user: UserType;
};
