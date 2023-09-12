import { useEffect, useState } from "react";
import { getConversionRate } from "~/api/exchange-rate";
import { MerchantOrder } from "~/type/order";

export const useTokenExchangeRate = (
  order: MerchantOrder,
  payTokenSymbol: string
): [
  isLoading: boolean,
  exchangeRate: { value: number; rate: number },
  fetchRate: () => void
] => {
  // fetch token rate
  const [exchangeRate, setExchangeRate] = useState({ value: 0, rate: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchRate = async () => {
    setIsLoading(true);
    try {
      if (payTokenSymbol) {
        let data = await getConversionRate({
          fiatSymbol: order.currency,
          fiatValue: Number(order.price),
          cryptoSymbol: payTokenSymbol,
        });
        const payload = {
          value: data.value,
          rate: data.rate,
        };
        setExchangeRate(payload);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, [payTokenSymbol]);

  return [isLoading, exchangeRate, fetchRate];
};
