import BigNumber from "bignumber.js";

export const FiatRateCal = (pricePair: string, margin: string) => {
  return new BigNumber(pricePair)
  .multipliedBy(new BigNumber(100).minus(new BigNumber(margin)))
  .dividedBy(new BigNumber(100))
  .toString();
}