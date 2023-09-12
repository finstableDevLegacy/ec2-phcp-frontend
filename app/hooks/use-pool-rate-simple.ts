import { useEffect, useState } from "react";
import { Chain } from "wagmi";
import { getTokenList } from "~/constants/tokens";
import { TokenType } from "~/type/token";
import { getBNBToken } from "~/utils/get-bnb-token";
import { getAmountInTokens } from "./use-amount-in-custom-provider";

export const usePoolRateSimple = ({
  payToken,
  receiveToken,
  selectedChain,
}: {
  payToken: TokenType;
  receiveToken: TokenType;
  selectedChain: Chain;
}) => {
  const [isFetchingPoolRate, setIsFetchingPoolRate] = useState(true);
  const [poolRate, setPoolRate] = useState("0");
  const getAmountInTokensHelper = (
    amountOut: string,
    tokensPath: TokenType[]
  ) => {
    return getAmountInTokens(amountOut, tokensPath, selectedChain);
  };
  const tokenList = getTokenList(selectedChain?.id);
  const getBNBToken = () => {
    const BNBtoken = tokenList.find((token) => token?.tokenSymbol === "BNB");
    if (!BNBtoken) {
      throw new Error("BNB not found");
    }
    return BNBtoken;
  };
  useEffect(() => {
    const getPathIncludeBnb = () => [payToken, getBNBToken(), receiveToken];
    const pathExcludeBnb = [payToken, receiveToken];
    const fetchPoolRate = async () => {
      let fetchedPoolRate: string = "";
      try {
        setIsFetchingPoolRate(true);

        if (
          (payToken?.tokenSymbol === "PHCP" ||
            receiveToken?.tokenSymbol === "PHCP") &&
          payToken?.tokenAddress?.toLowerCase() !==
            receiveToken?.tokenAddress?.toLowerCase()
        ) {
          fetchedPoolRate = (await getAmountInTokensHelper(
            "1",
            getPathIncludeBnb().reverse()
          )) as string;
        } else {
          fetchedPoolRate = (await getAmountInTokensHelper(
            "1",
            pathExcludeBnb
          )) as string;
        }
        setPoolRate(fetchedPoolRate);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingPoolRate(false);
      }
    };
    if (!payToken || !receiveToken) {
      return;
    }
    fetchPoolRate().catch(console.error);
    return;
  }, [payToken, receiveToken]);

  return [poolRate, isFetchingPoolRate] as [string, boolean];
};
