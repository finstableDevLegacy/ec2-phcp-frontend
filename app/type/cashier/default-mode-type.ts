export enum CashierDefaultModeType {
  TOKEN = "token",
  FIAT = "fiat",
}

export type DefaultModeCashierResponse = {
  type: CashierDefaultModeType;
};
