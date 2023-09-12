import create from "zustand";
import multicallService from "../services/multicall.service";
import { Provider } from "@ethersproject/providers";
import { NetworkID } from "../constants/network-id";

const store = (set: any, get: any) => ({
  address: "" as string,
  balances: {} as Record<string, string>,
  allowances: {} as Record<string, string>,
  loadTokenBalances: async (provider: Provider, network: NetworkID) => {
    const address = get().address;
    if (address) {
      const balances = await multicallService.getTokenBalances(
        address,
        provider,
        network
      );
      set({ balances });
    } else {
      set({ balances: {} });
    }
  },
  setAddress: (address: string) => {
    set({ address });
  },
});

type WalletStore = ReturnType<typeof store>;
const useWalletStore = create<WalletStore>(store);

export default useWalletStore;
