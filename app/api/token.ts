import axios from "axios";
import { TokenResponse } from "~/type/api-response";
import { TokenType } from "~/type/token";

const TRANSCRYPT_BACKEND = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

export const api = () =>
  axios.create({
    baseURL: TRANSCRYPT_BACKEND,
  });

export const getTokenBySymbolAndNetwork = async (
  symbol: string,
  networkId: string
) => {
  const resp = await api().get(
    `/tokens?filter=tokenSymbol||$eq||${symbol}&filter=networkId||$eq||${networkId}`
  );

  return resp.data[0] as TokenType;
};

export const getTokensByNetworkId = async (networkId: string) => {
  const resp = await api().get(`/tokens?filter=networkId||$eq||${networkId}`);

  return resp.data as TokenType[];
};
