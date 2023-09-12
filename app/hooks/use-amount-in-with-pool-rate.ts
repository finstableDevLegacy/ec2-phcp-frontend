import { useEffect, useState } from "react";
import { Chain } from "wagmi";
import { getTokenList } from "~/constants/tokens";
import { TokenType } from "~/type/token";
import { getAmountInTokens } from "./use-amount-in-custom-provider";
import { usePoolRateSimple } from "./use-pool-rate-simple";

export const useAmountInWithPoolRate = ({
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
  // receiveTokenPricePerFiat fiat = 1 receiveToken
  // totalFiatRequire fiat = totalFiatRequire/receiveTokenPricePerFiat receiveToken
  // 1 receiveToken = poolRate payToken
  // totalFiatRequire/receiveTokenPricePerFiat receiveToken = poolRate * totalFiatRequire/receiveTokenPricePerFiat payToken
  const [poolRate, isFetchingPoolRate] = usePoolRateSimple({
    payToken,
    receiveToken,
    selectedChain,
  });
  const amountIn = `${
    (Number(poolRate) * totalFiatRequire) / receiveTokenPricePerFiat
  }`;
  const plusPercent = 50 / 100;
  const calAmountInPlus = () => {
    if (payToken === receiveToken) {
      return amountIn;
    }
    return +amountIn + +amountIn * plusPercent;
  };
  const amountInPlus = calAmountInPlus();

  return [poolRate, isFetchingPoolRate, amountIn, amountInPlus] as [
    string,
    boolean,
    string,
    string
  ];
};
