import {
  CashierDefaultModeType,
  DefaultModeCashierResponse,
} from "~/type/cashier/default-mode-type";
import { apiWithToken } from "../base-url";

export const getDefaultModeCashier = async (token: string) => {
  return {
    type: CashierDefaultModeType.FIAT,
  } as DefaultModeCashierResponse;
};
