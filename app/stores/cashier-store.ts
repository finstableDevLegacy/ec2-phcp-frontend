import { getChains } from "~/config/network";
import create from "zustand";
import { Chain } from "wagmi";

const key = "selected_chain_cashier";
const cashierStore = (set: any, get: any) => {
  let chains: Chain[] = [];
  if (typeof window !== "undefined") {
    chains = getChains((window as any).ENV.ENV).chains;
  }
  return {
    selectedChainId: getPersistedChain() || chains?.[0]?.id,
    setSelectedChainId: (chainId: number) => {
      localStorage.setItem(key, `${chainId}`);
      set({
        selectedChainId: chainId,
      });
    },
    getSelectedChain: () => {
      return (
        chains?.find((chain) => `${chain.id}` === `${get().selectedChainId}`) ||
        chains[0]
      );
    },
  };
};

const getPersistedChain = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
};

type CashierStore = ReturnType<typeof cashierStore>;
const useCashierStore = create<CashierStore>(cashierStore);

export default useCashierStore;
