import create from "zustand";

import {
  getDefaultChainToken,
  getStableTokenSymbols,
  getTokenList,
} from "../constants/tokens";
import { getConversionRate } from "../api/exchange-rate";
import { getAmountInTokens } from "~/hooks/use-amount-in-custom-provider";
import { Chain } from "wagmi";

type ModuleChains = {
  pay?: number;
  casier?: number;
  merchant?: number;
  dealer?: number;
};

const appStore = (set: any, get: any) => ({
  tokenPrices: {} as Record<string, number>,
  loadTokenPrices: async (chainId: number) => {
    const tokenList = getTokenList(chainId);
    const promises = tokenList.map((token) => {
      return getConversionRate({
        fiatSymbol: "USD",
        fiatValue: 1,
        cryptoSymbol: token.tokenSymbol as string,
      });
    });
    const res = await Promise.all(promises);
    const tokenPrices = res.reduce((prev, curr, index) => {
      prev[tokenList[index].tokenSymbol as string] = 1 / curr.value;
      return prev;
    }, {} as Record<string, number>);

    set({ tokenPrices });
  },
  tokenPricesFiat: {} as Record<string, number>,
  loadTokenPricesFiat: async (chainId: number, fiatSymbol: string) => {
    const tokenList = getTokenList(chainId);

    const promises = tokenList.map((token) => {
      return getConversionRate({
        fiatSymbol,
        fiatValue: 1,
        cryptoSymbol: token.tokenSymbol!,
      });
    });
    const res = await Promise.all(promises);

    const tokenPricesFiat = res.reduce((prev, curr, index) => {
      prev[tokenList[index].tokenSymbol as string] = 1 / curr.value;
      return prev;
    }, {} as Record<string, number>);

    set({ tokenPricesFiat });
  },
  rateFiatToken: {} as Record<string, number>,
  loadRateFiatToken: async (
    _tokenPricesFiat: Record<string, number>,
    chain: Chain
  ) => {
    const loadRateFiatTokenArrProm = Object.entries(_tokenPricesFiat).map(
      async (token) => {
        const [tokenSymbol] = token;
        const isStableToken = getStableTokenSymbols().includes(tokenSymbol);
        if (isStableToken) {
          return token;
        }
        const tokenList = getTokenList(chain.id);
        let defaultToken = getDefaultChainToken(chain.id);
        const defaultTokenInStore = Object.entries(_tokenPricesFiat).find(
          ([symbol]) => symbol === defaultToken.tokenSymbol
        );
        const fiatTokenRate = defaultTokenInStore?.[1];
        const targetToken = tokenList.find(
          (token) => token?.tokenSymbol === tokenSymbol
        );
        if (tokenSymbol === "BNB") {
          return token;
        }
        if (targetToken && fiatTokenRate) {
          if (tokenSymbol === "PHCP") {
            const bnbToken = tokenList.find(
              (token) => token?.tokenSymbol === "BNB"
            );
            if (bnbToken) {
              const amountIn = (await getAmountInTokens(
                "1",
                [defaultToken, bnbToken, targetToken],
                chain
              )) as number;
              // 1 BUSD = x USD
              // y BUSD = 1 PHCP
              // 1 PHCP = y BUSD
              // 1 PHCP = y*x USD
              return [tokenSymbol, amountIn * fiatTokenRate] as [
                string,
                number
              ];
            }
            return token;
          } else {
            const amountIn = (await getAmountInTokens(
              "1",
              [defaultToken, targetToken],
              chain
            )) as number;
            return [tokenSymbol, amountIn * fiatTokenRate] as [string, number];
          }
        } else {
          return token;
        }
      }
    );
    const loadRateFiatTokenArrRes = await Promise.all(loadRateFiatTokenArrProm);
    const rateFiatToken = loadRateFiatTokenArrRes.reduce<
      Record<string, number>
    >((prev, cur) => {
      const [tokenSymbol, rate] = cur;
      prev[tokenSymbol] = rate;
      return prev;
    }, {});
    set({ rateFiatToken });
  },
  defaultChain: 0,
  setDefaultChain: (chainId: number) => {
    set({ defaultChain: chainId });
  },
  moduleDefaultChain: {} as ModuleChains,
  setmoduleDefaultChain: (chains: ModuleChains) => {
    set({ moduleDefaultChain: chains });
  },
});

type AppStore = ReturnType<typeof appStore>;
const useAppStore = create<AppStore>(appStore);

export default useAppStore;
