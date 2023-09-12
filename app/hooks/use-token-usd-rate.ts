import { useEffect, useState } from "react";
import { Chain, useNetwork } from "wagmi";
import {
  getDefaultChainToken,
  getStableTokenSymbols,
  getTokenList,
} from "~/constants/tokens";
import useAppStore from "~/stores/app-store";
import { getAmountInTokens } from "./use-amount-in-custom-provider";

export const useTokenUsdRate = (tokenSymbol: string) => {
  const [rate, setRate] = useState(0);
  const loadTokenPrice = useAppStore((state) => state.loadTokenPrices);
  const tokenPrices = useAppStore((state) => state.tokenPrices);
  const isStableToken = getStableTokenSymbols().includes(tokenSymbol);
  const [{ data, loading }] = useNetwork();

  useEffect(() => {
    const getRate = async () => {
      if (data.chain?.id && !loading) {
        if (tokenPrices === {}) {
          loadTokenPrice(data.chain?.id!);
        }
        if (isStableToken) {
          setRate(tokenPrices[tokenSymbol]);
        } else {
          const networkId = data.chain?.id!;
          let defaultToken = getDefaultChainToken(networkId);
          if (defaultToken) {
            const tokenList = getTokenList(data?.chain?.id);
            const targetToken = tokenList.find(
              (token) => token?.tokenSymbol === tokenSymbol
            );
            if (targetToken) {
              if (tokenSymbol === "PHCP") {
                const bnbToken = tokenList.find(
                  (token) => token?.tokenSymbol === "BNB"
                );
                if (bnbToken) {
                  const amountIn = (await getAmountInTokens(
                    "1",
                    [defaultToken, bnbToken, targetToken],
                    data?.chain as Chain
                  )) as number;
                  setRate(amountIn * tokenPrices[tokenSymbol]);
                }
              } else {
                const amountIn = (await getAmountInTokens(
                  "1",
                  [defaultToken, targetToken],
                  data?.chain as Chain
                )) as number;
                setRate(amountIn * tokenPrices[tokenSymbol]);
              }
            }
          }
        }
      }
    };
    getRate();
  }, [data, loading]);

  return rate;
};
