import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Chain } from "wagmi";

export const useCustomProvider = (chain: Chain) => {
  const provider = useMemo(
    () => new ethers.providers.JsonRpcProvider(chain.rpcUrls[0]),
    [chain]
  );

  const [network, setNetwork] = useState<ethers.providers.Network>();

  useEffect(() => {
    provider.getNetwork().then((n) => {
      setNetwork(n);
    });
  }, [provider]);

  return { provider, network };
};
