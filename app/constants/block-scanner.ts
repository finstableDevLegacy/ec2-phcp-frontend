import { NetworkID } from "./network-id";

type AddressType<T> = T extends NetworkID.Bsc
  ? typeof bsc
  : T extends NetworkID.BscTest
  ? typeof bscTest
  : {};

const bsc = "https://bscscan.com/tx";

const bscTest = "https://testnet.bscscan.com/tx";

export const getBlockScanner = <T extends NetworkID>(networkID: T) => {
  switch (networkID) {
    case NetworkID.Bsc:
      return bsc as AddressType<T>;
    case NetworkID.BscTest:
      return bscTest as AddressType<T>;
    default:
      return bsc as AddressType<T>;
  }
};
