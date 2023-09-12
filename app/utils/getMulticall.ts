import { Multicall } from "ethereum-multicall";
import { getAddressList } from "../constants/address-list";
import { NetworkID } from "../constants/network-id";

export const getMulticall = (provider: any, network: NetworkID) => {
  const { Multicall: MulticallAddr } = getAddressList(network) as any;
  return new Multicall({
    ethersProvider: provider,
    multicallCustomContractAddress: MulticallAddr,
  });
};
