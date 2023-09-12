import { useEffect, useState } from "react";
import { Chain } from "wagmi";
import { TokenType } from "~/type/token";
import { getAmountInTokens } from "./use-amount-in-custom-provider";

export const usePoolRateCustomerPay = ({
  payToken,
  receiveToken,
  loading,
  tokenPrice,
  getBNBToken,
  selectedChain,
}: {
  payToken: TokenType;
  receiveToken: TokenType;
  loading: boolean;
  tokenPrice: number;
  getBNBToken: () => TokenType;
  selectedChain: Chain;
}) => {
  const [isFetchingAmountIn, setIsFetchingAmountIn] = useState(true);
  const [amountIn, setAmountIn] = useState("0");
  const [isFetchingPoolRate, setIsFetchingPoolRate] = useState(true);
  const [poolRate, setPoolRate] = useState("0");
  const getAmountInTokensHelper = (
    amountOut: string,
    tokensPath: TokenType[]
  ) => {
    return getAmountInTokens(amountOut, tokensPath, selectedChain);
  };
  useEffect(() => {
    const getPathIncludeBnb = () => [payToken, getBNBToken(), receiveToken];
    const pathExcludeBnb = [payToken, receiveToken];
    const fetchAmountIn = async () => {
      let fetchedAmountIn: string = "";
      try {
        setIsFetchingAmountIn(true);

        if (
          (payToken?.tokenSymbol === "PHCP" ||
            receiveToken?.tokenSymbol === "PHCP") &&
          payToken?.tokenAddress?.toLowerCase() !==
            receiveToken?.tokenAddress?.toLowerCase()
        ) {
          fetchedAmountIn = (await getAmountInTokensHelper(
            tokenPrice.toString(),
            getPathIncludeBnb()
          )) as string;
          fetchedAmountIn = (await getAmountInTokensHelper(
            tokenPrice.toString(),
            getPathIncludeBnb()
          )) as string;
        } else {
          fetchedAmountIn = (await getAmountInTokensHelper(
            tokenPrice.toString(),
            pathExcludeBnb
          )) as string;
        }
        setAmountIn(fetchedAmountIn);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingAmountIn(false);
      }
    };
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
    fetchAmountIn().catch(console.error);
    fetchPoolRate().catch(console.error);
    return;
  }, [payToken, receiveToken]);

  const plusPercent = 0.5 / 100;
  const calAmountInPlus = () => {
    if (payToken === receiveToken) {
      return amountIn;
    }
    return +amountIn + +amountIn * plusPercent;
  };

  return [
    amountIn,
    poolRate,
    isFetchingAmountIn,
    isFetchingPoolRate,
    calAmountInPlus(),
  ] as [string, string, boolean, boolean, number];
};
