import { TokenType } from "~/type/token";

export const getBNBToken = (tokenList: TokenType[]) => {
  const BNBtoken = tokenList.find((token) => token?.tokenSymbol === "BNB");
  if (!BNBtoken) {
    throw new Error("BNB not found");
  }
  return BNBtoken;
};
