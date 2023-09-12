import { Chain } from "wagmi";
import { bsc, bscTestnet, mumbai, polygon } from "~/chains";

export type getChainType = {
  defaultChain: Chain;
  chains: Chain[];
};

export const getChains = (nodeEnv?: string) => {
  let defaultChain: Chain = bscTestnet;
  let chains: Chain[] = [bscTestnet];

  if (nodeEnv === "production") {
    defaultChain = bsc;
    chains = [bsc];
  }

  return {
    defaultChain,
    chains,
  };
};
