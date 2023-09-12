type ExchangeRate = {
  symbol: string;
  value: number;
};

type ConversionRate = {
  fiatSymbol: string;
  fiatValue: number;
  cryptoSymbol: string;
};

type Response = {
  value: number;
  rate: number;
};

const TRANSCRYPT_BACKEND = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

export const getFiatCurrencyList = async () => {
  try {
    const resp = await fetch(`${TRANSCRYPT_BACKEND}/currency/fiat`);
    const { result } = await resp.json();
    return result.result;
  } catch (error) {
    throw error;
  }
};

export const getUSDExchangeRate = async ({ symbol, value }: ExchangeRate) => {
  try {
    const resp = await fetch(`${TRANSCRYPT_BACKEND}/exchange-rate/to-usd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbol,
        value,
      }),
    });
    const data = await resp.json();
    const result = data.result as Response;
    return result;
  } catch (error) {
    throw error;
  }
};

export const getConversionRate = async ({
  fiatSymbol,
  fiatValue,
  cryptoSymbol,
}: ConversionRate) => {
  try {
    let convertSymbol =
      cryptoSymbol === "PHCP"
        ? "BUSD"
        : cryptoSymbol === "WIS"
        ? "USDT"
        : cryptoSymbol;
    const resp = await fetch(`${TRANSCRYPT_BACKEND}/exchange-rate/conversion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fiatSymbol,
        fiatValue,
        cryptoSymbol: convertSymbol,
      }),
    });
    const data = await resp.json();
    const result = data.result as Response;
    return result;
  } catch (error) {
    throw error;
  }
};
