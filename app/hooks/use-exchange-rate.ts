import _ from "lodash";
import { useEffect, useState } from "react";
import { Chain } from "wagmi";
import { getConversionRate } from "~/api/exchange-rate";
import { FiatCurrencyType } from "~/type/currency";
import { TokenType } from "~/type/token";
import { getAmountInTokens } from "./use-amount-in-custom-provider";

export const useExchangeRate = ({
  selectedCurrency,
  price,
  receiveToken,
  tokenList,
  selectedChain,
}: {
  selectedCurrency: FiatCurrencyType;
  price: number;
  receiveToken: TokenType;
  tokenList: TokenType[];
  selectedChain: Chain;
}) => {

  const [exchangeRate, setExchangeRate] = useState({ rate: 0 });
  const [isFetchingExRate, setIsFetchingExRate] = useState(false);
  const fetchRate = async () => {    
    try {
      let data = await getConversionRate({
        fiatSymbol: selectedCurrency.symbol,
        fiatValue: price || 0,
        cryptoSymbol: receiveToken.tokenSymbol! || "USDT",
      });
      if (receiveToken?.tokenSymbol === "PHCP") {
        const poolRate = await getAmountInTokens(
          "1",
          [
            tokenList.find(
              (token) => token?.tokenSymbol === "BUSD"
            ) as TokenType,
            tokenList.find(
              (token) => token?.tokenSymbol === "BNB"
            ) as TokenType,
            tokenList.find(
              (token) => token?.tokenSymbol === "PHCP"
            ) as TokenType,
          ],
          selectedChain
        );
          
        if (!poolRate) {          
          throw new Error("rate not found");
        }
        const payload = {
          rate: data.rate * +`${+poolRate}`,
        };

        setExchangeRate(payload);
      } else if (receiveToken?.tokenSymbol === "WIS") {
        const poolRateUSDTWIS = await getAmountInTokens(
          "1",
          [
            tokenList.find(
              (token) => token?.tokenSymbol === "USDT"
            ) as TokenType,
            tokenList.find(
              (token) => token?.tokenSymbol === "WIS"
            ) as TokenType,
          ],
          selectedChain
        );
        const payload = {
          rate: data.rate * +`${poolRateUSDTWIS}`,
        };
        setExchangeRate(payload);
      } else if (data) {
        const payload = {
          rate: data.rate,
        };
        setExchangeRate(payload);
      }
    } catch (err) {
      setExchangeRate({ rate: 0 });
      console.error(err);
    } finally {
      setIsFetchingExRate(false);
    }
  };

  const fetchRateDebounce = _.debounce(fetchRate, 250);

  useEffect(() => {
    setIsFetchingExRate(true);
    fetchRateDebounce();
  }, [price, selectedCurrency.symbol, receiveToken.tokenSymbol]);

  return [
    exchangeRate,
    isFetchingExRate,
    setIsFetchingExRate,
    fetchRateDebounce,
  ] as [
    { rate: number },
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    _.DebouncedFunc<() => Promise<void>>
  ];
};
