import { Chain } from "wagmi";
import { getTokenList } from "~/constants/tokens";
import { TokenType } from "~/type/token";
import { getAmountInTokens } from "./use-amount-in-custom-provider";

const getExactAmountIn = async ({
  payToken,
  receiveToken,
  selectedChain,
  amountOut,
}: {
  payToken: TokenType;
  receiveToken: TokenType;
  selectedChain: Chain;
  amountOut: string;
}): Promise<string> => {
  let amountIn = "0";
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
  const getPathIncludeBnb = () => [payToken, getBNBToken(), receiveToken];
  const pathExcludeBnb = [payToken, receiveToken];
  const fetchPoolRate = async () => {
    let fetchedPoolRate: string = "";
    try {
      if (
        (payToken?.tokenSymbol === "PHCP" ||
          receiveToken?.tokenSymbol === "PHCP") &&
        payToken?.tokenAddress?.toLowerCase() !==
          receiveToken?.tokenAddress?.toLowerCase()
      ) {
        fetchedPoolRate = (await getAmountInTokensHelper(
          amountOut,
          getPathIncludeBnb()
        )) as string;
      } else {
        fetchedPoolRate = (await getAmountInTokensHelper(
          amountOut,
          pathExcludeBnb
        )) as string;
      }
      if (fetchedPoolRate) {
        amountIn = fetchedPoolRate;
      }
    } catch (err) {
      console.error(err);
    }
  };
  await fetchPoolRate();
  return amountIn;
};

const getPoolRate = async ({
  payToken,
  receiveToken,
  selectedChain,
}: {
  payToken: TokenType;
  receiveToken: TokenType;
  selectedChain: Chain;
}): Promise<string> => {
  let poolRate = "0";
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
  const getPathIncludeBnb = () => [payToken, getBNBToken(), receiveToken];
  const pathExcludeBnb = [payToken, receiveToken];
  const fetchPoolRate = async () => {
    let fetchedPoolRate: string = "";
    try {
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
      if (fetchedPoolRate) {
        poolRate = fetchedPoolRate;
      }
    } catch (err) {
      console.error(err);
    }
  };
  await fetchPoolRate();
  return poolRate;
};

export const getExactAmountInWithPoolRate = async ({
  payToken,
  receiveToken,
  selectedChain,
  amountOut,
}: {
  payToken: TokenType;
  receiveToken: TokenType;
  selectedChain: Chain;
  amountOut: string;
}) => {
  const amountIn = await getExactAmountIn({
    payToken,
    receiveToken,
    selectedChain,
    amountOut,
  });
  const plusPercent = 0.5 / 100;
  const calAmountInPlus = () => {
    if (payToken === receiveToken) {
      return amountIn;
    }
    return +amountIn + +amountIn * plusPercent;
  };
  const amountInPlus = calAmountInPlus();

  return [amountIn, amountInPlus] as [string, string];
};

export const getAmountInWithPoolRate = async ({
  payToken,
  receiveToken,
  selectedChain,
  receiveTokenPricePerFiat,
  totalFiatRequire,
}: {
  payToken: TokenType;
  receiveToken: TokenType;
  selectedChain: Chain;
  receiveTokenPricePerFiat: number;
  totalFiatRequire: number;
}) => {
  const poolRate = await getPoolRate({ payToken, receiveToken, selectedChain });
  const amountIn = `${
    (Number(poolRate) * totalFiatRequire) / receiveTokenPricePerFiat
  }`;
  const plusPercent = 0.5 / 100;
  const calAmountInPlus = () => {
    if (payToken === receiveToken) {
      return amountIn;
    }
    return +amountIn + +amountIn * plusPercent;
  };
  const amountInPlus = calAmountInPlus();

  return [poolRate, amountIn, amountInPlus] as [string, string, string];
};
