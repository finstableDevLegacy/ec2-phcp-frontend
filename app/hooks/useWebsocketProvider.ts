import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Chain } from "wagmi";

export const useWebsocketProvider = (wss: string) => {
  const provider = useMemo(
    () => new ethers.providers.WebSocketProvider(wss),
    [wss]
  );

  const [network, setNetwork] = useState<ethers.providers.Network>();

  useEffect(() => {
    provider.getNetwork().then((n) => {
      setNetwork(n);
    });
  }, [provider]);

  return { provider, network };
};
