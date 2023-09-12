import { Chain } from "wagmi";

export type WssURI = {
  wss: string;
};

export const mainnet: Chain & WssURI = {
  id: 1,
  name: "Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: [
    process.env.ALCHEMY_ID
      ? `https://mainnet.infura.io/v3/${process.env.ALCHEMY_ID}`
      : "https://mainnet.infura.io/v3/UuZaRWkN8i9K1_RvrtssdRaRn6MTZ49_",
  ],
  blockExplorers: [{ name: "Etherscan", url: "https://etherscan.io" }],
  wss: process.env.ALCHEMY_ID
    ? `wss://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`
    : "wss://eth-rinkeby.alchemyapi.io/v2/UuZaRWkN8i9K1_RvrtssdRaRn6MTZ49_",
};

export const rinkeby: Chain & WssURI = {
  id: 4,
  name: "Rinkeby",
  nativeCurrency: { name: "Rinkeby Ether", symbol: "rETH", decimals: 18 },
  rpcUrls: [
    process.env.ALCHEMY_ID
      ? `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`
      : "https://eth-rinkeby.alchemyapi.io/v2/UuZaRWkN8i9K1_RvrtssdRaRn6MTZ49_",
  ],
  blockExplorers: [{ name: "Etherscan", url: "https://rinkeby.etherscan.io" }],
  testnet: true,
  wss: process.env.ALCHEMY_ID
    ? `wss://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`
    : "wss://eth-rinkeby.alchemyapi.io/v2/UuZaRWkN8i9K1_RvrtssdRaRn6MTZ49_",
};

export const bsc: Chain = {
  id: 56,
  name: "Binance Smart Chain",
  nativeCurrency: { name: "Binance Coin", symbol: "BNB", decimals: 18 },
  rpcUrls: [
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.defibit.io/",
    "https://bsc-dataseed1.ninicoin.io/",
  ],
  blockExplorers: [
    {
      name: "bscscan",
      url: "https://bscscan.com",
    },
  ],
};

export const bscTestnet: Chain = {
  id: 97,
  name: "BSC Testnet",
  nativeCurrency: { name: "Binance Coin", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://data-seed-prebsc-1-s2.binance.org:8545/"],
  blockExplorers: [
    {
      name: "testnet.bscscan",
      url: "https://testnet.bscscan.com",
    },
  ],
  testnet: true,
};

export const polygon: Chain = {
  id: 137,
  name: "Polygon",
  nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
  rpcUrls: ["https://polygon-rpc.com"],
  blockExplorers: [
    {
      name: "polygonscan",
      url: "https://polygonscan.com",
    },
  ],
  testnet: true,
};

export const mumbai: Chain = {
  id: 80001,
  name: "Mumbai Testnet",
  nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
  rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
  blockExplorers: [
    {
      name: "mumbai.polygonscan",
      url: "https://mumbai.polygonscan.com",
    },
  ],
  testnet: true,
};

type chainId = {
  [key: number]: string;
};

export const chainLogo: chainId = {
  56: "../../assets/chain/bsc.svg",
  97: "../../assets/chain/bsc.svg",
  96: "../../assets/chain/bkc.svg",
  25925: "../../assets/chain/bkc.svg",
  137: "../../assets/chain/polygon.svg",
  80001: "../../assets/chain/polygon.svg",
  4: "../../assets/chain/eth.svg",
};
