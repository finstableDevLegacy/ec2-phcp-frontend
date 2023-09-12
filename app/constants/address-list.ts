import { NetworkID } from "./network-id";

type AddressType<T> = T extends NetworkID.Bsc
  ? typeof bsc
  : T extends NetworkID.BscTest
  ? typeof bscTest
  : T extends NetworkID.Polygon
  ? typeof polygon
  : T extends NetworkID.Mumbai
  ? typeof mumbai
  : {};

export const getAddressList = <T extends NetworkID>(networkID: T) => {
  switch (networkID) {
    case NetworkID.Bsc:
      return bsc as AddressType<T>;
    case NetworkID.BscTest:
      return bscTest as AddressType<T>;
    case NetworkID.Polygon:
      return polygon as AddressType<T>;
    case NetworkID.Mumbai:
      return mumbai as AddressType<T>;
    default:
      return bsc as AddressType<T>;
  }
};

const bsc = {
  Transcrypt: "0x4302c90A57012CCd1873D990202B27dB1b47fE10",
  SwapRouter: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  Multicall: "0x41263cBA59EB80dC200F3E2544eda4ed6A90E76C",
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  PHCP: "0x9E824e2c7966E4b850aB7E06125de32b6D4739E0",
  WIS: "0xCd6C2EdFF2375374a1bAd2d6f48c443769a1110C",
  BNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
};

const bscTest = {
  Transcrypt: "0xBd87c5501bEdF25c944375661e4926b8981c3d25",
  SwapRouter: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
  Multicall: "0xae11C5B5f29A6a25e955F0CB8ddCc416f522AF5C",
  BUSD: "0x12bd9885341dc390986931c2d3d466D70E84b4e1",
  USDT: "0x2cDCc9f5934E54EbAf694b86B4fF29195372febd",
  USDC: "0x2564a6B3dC2E18044c509AfF6d0dC059Fd0061A8",
  DAI: "0x68C87D825EB675C6772fa6A21628d4565F66547d",
  PHCP: "0x17C8df2c1735438Af8497dcb9055b711b6e276F5",
  WIS: "0xC53a86d3e8Fb8373B6C34e4dd2300a439BC33742",
  BNB: "0xEF04133E09Cc944cEa5Ad892fcc1AC9665e3c6C9",
};

const polygon = {
  Transcrypt: "",
  BUSD: "",
  USDT: "",
  USDC: "",
  DAI: "",
  SwapRouter: "",
  Multicall: "",
};

const mumbai = {
  Transcrypt: "0x87f847492DeB40c5F97c00c84d7101147240A22E",
  SwapRouter: "0x8954AfA98594b838bda56FE4C12a09D7739D179b",
  Multicall: "0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc",
  USDT: "0x2E804e5a20Ae3F9708389E9D3235e20010d09CE7",
  USDC: "0xFbd6595BAD4cc1E26E385CA94E5a4878B903Ad60",
  DAI: "0x45a0c5B81313001FCE59e93342C68B9af0b3971f",
  WIS: "0x6bc89B1f1B7c1c1ad7Fa8E2Cf04E71A4f6aB9fC7",
};
