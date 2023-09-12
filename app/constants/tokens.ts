import { NetworkID } from "./network-id";
import { TokenType } from "~/type/token";
import { getAddressList } from "./address-list";

export const TOKENS: Record<string, Omit<TokenType, "tokenAddress">> = {
  USDT: {
    tokenDecimal: 18,
    tokenName: "USD Tether",
    tokenSymbol: "USDT",
    tokenLogoUri: "/assets/holiday-icon.png",
  },
  PHCP: {
    tokenDecimal: 18,
    tokenName: "PHCPay",
    tokenSymbol: "PHCP",
    tokenLogoUri: "/assets/phc_logo.png",
  },
  BUSD: {
    tokenDecimal: 18,
    tokenName: "BUSD",
    tokenSymbol: "BUSD",
    tokenLogoUri: "/assets/busd.png",
  },
  WIS: {
    tokenDecimal: 18,
    tokenName: "WIS",
    tokenSymbol: "WIS",
    tokenLogoUri: "/assets/wisdom-token-logo.png",
  },
  BNB: {
    tokenDecimal: 18,
    tokenName: "BNB",
    tokenSymbol: "BNB",
    tokenLogoUri: "/assets/wisdom-token-logo.png",
  },
};

const mapTokenAddress = (
  symbols: string[],
  addressList: Record<string, string>
) => {
  const retTokenList = symbols.reduce((prev, cur) => {
    const tokenAddress = addressList[cur];
    const token = TOKENS[cur];
    if (!token) return prev;
    prev.push({ ...token, tokenAddress });
    return prev;
  }, [] as TokenType[]);
  return retTokenList;
};

export const getTokenList = (networkID: NetworkID) => {
  switch (networkID) {
    case NetworkID.Bsc:
      return mapTokenAddress(
        ["BUSD", "USDT", "PHCP", "BNB", "WIS", "USDC"],
        getAddressList(networkID)
      );
    case NetworkID.BscTest:
      return mapTokenAddress(
        ["BUSD", "USDT", "PHCP", "BNB", "WIS", "USDC"],
        getAddressList(networkID)
      );
    case NetworkID.Polygon:
      return mapTokenAddress(
        ["USDT", "DAI", "USDC"],
        getAddressList(networkID)
      );
    case NetworkID.Mumbai:
      return mapTokenAddress(
        ["USDT", "DAI", "USDC", "WIS"],
        getAddressList(networkID)
      );
    default:
      return [];
  }
};

export const getTokenMap = (networkID: NetworkID) =>
  Object.values(getTokenList(networkID)).reduce((prev, cur) => {
    prev[cur.tokenSymbol!] = cur;
    return prev;
  }, {} as Record<string, TokenType>);

export const getDefaultChainToken = (networkID: NetworkID) => {
  switch (networkID) {
    case NetworkID.Bsc:
      return getToken(networkID, "BUSD");
    case NetworkID.BscTest:
      return getToken(networkID, "BUSD");
    case NetworkID.Polygon:
      return getToken(networkID, "USDT");
    case NetworkID.Mumbai:
      return getToken(networkID, "USDT");
    default:
      return getToken(networkID, "USDT");
  }
};

export const getStableTokenSymbols = () => {
  return ["USDT", "BUSD", "DAI", "USDC"];
};

export const getToken = (networkID: NetworkID, symbol: string) => {
  const tokenList = getTokenList(networkID);
  return tokenList.find((token) => token.tokenSymbol === symbol)!;
};
