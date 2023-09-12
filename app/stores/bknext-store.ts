import create from "zustand";
import { WalletType } from "~/constants/wallet-type";
import bitkubNextService from "~/services/bk-next";
import { requestWindow } from "~/utils/request-window";
import { BKNextAuthRes } from "~/type/bknext/bk-next.type";
import localService from "~/services/localstorage";
import STORAGE_KEYS from "~/constants/storage-key";
import multicallService from "../services/multicall.service";
import { Provider } from "@ethersproject/providers";
import { NetworkID } from "../constants/network-id";

const bkNextStore = (set: any, get: any) => ({
  bkNextAddress: "" as string,
  bkNextPhone: "" as string,
  balances: {} as Record<string, string>,
  allowances: {} as Record<string, string>,
  loadSession: async () => {
    const refreshToken = localService.getItem(STORAGE_KEYS.BK_REFRESH_TOKEN);
    if (refreshToken) return get().connectBitkubNext() as Promise<string>;
  },
  connectBitkubNext: async () => {
    try {
      let refreshToken = localService.getItem(STORAGE_KEYS.BK_REFRESH_TOKEN);
      let accessToken = localService.getItem(STORAGE_KEYS.BK_ACCESS_TOKEN);

      if (refreshToken) {
        const res = await bitkubNextService.extendToken(refreshToken);

        refreshToken = res.refresh_token;
        accessToken = res.access_token;
      } else {
        const newWindow = window.open(
          `${window.location.origin}/callback-loading`,
          "_blank",
          `toolbar=no,
                    location=no,
                    status=no,
                    menubar=no,
                    scrollbars=yes,
                    resizable=yes,
                    width=400px,
                    height=600px`
        );

        const res = (await requestWindow(
          newWindow as Window,
          bitkubNextService.getAuthorizeUrl(),
          STORAGE_KEYS.OAUTH_RESULT,
          STORAGE_KEYS.OAUTH_ERROR
        )) as BKNextAuthRes;

        refreshToken = res.refresh_token;
        accessToken = res.access_token;
      }

      const res = await bitkubNextService.loadAccountInfo(accessToken);
      const account = res.data.wallet_address;
      const phone = res.data.phone;

      set({
        bkNextAddress: account,
        walletType: WalletType.BitkubNext,
        bkNextPhone: phone,
      });

      localService.setItem(STORAGE_KEYS.BK_REFRESH_TOKEN, refreshToken);
      localService.setItem(STORAGE_KEYS.BK_ACCESS_TOKEN, accessToken);
      localService.setItem(STORAGE_KEYS.WALLET_TYPE, WalletType.BitkubNext);

      // check old interval
      const oldIv = localService.getItem(STORAGE_KEYS.REFRESH_IV);
      if (!oldIv) {
        // refresh token
        const iv = setInterval(async () => {
          const refreshToken = localService.getItem(
            STORAGE_KEYS.BK_REFRESH_TOKEN
          );
          const res = await bitkubNextService.extendToken(refreshToken);

          const info = await bitkubNextService.loadAccountInfo(accessToken);
          const phone = info.data.phone;

          set({ bkNextPhone: phone });

          localService.setItem(
            STORAGE_KEYS.BK_REFRESH_TOKEN,
            res.refresh_token
          );
          localService.setItem(STORAGE_KEYS.BK_ACCESS_TOKEN, res.access_token);
        }, 14 * 60 * 1000);

        // clear interval on close window
        window.onbeforeunload = (ev) => {
          clearInterval(iv);
          localService.removeItem(STORAGE_KEYS.REFRESH_IV);
        };

        localService.setItem(STORAGE_KEYS.REFRESH_IV, iv);
      }

      return account;
    } catch (e) {
      localService.removeItem(STORAGE_KEYS.BK_REFRESH_TOKEN);
      localService.removeItem(STORAGE_KEYS.BK_ACCESS_TOKEN);
      localService.removeItem(STORAGE_KEYS.WALLET_TYPE);
      set({
        bkNextAddress: null,
        walletType: null,
      });
      console.error("connect bk next error: ", e);
      return null;
    }
  },
  loadTokenBalances: async (provider: Provider, network: NetworkID) => {
    const address = get().bkNextAddress;
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
  setWalletAddress: async (bkNextAddress: string) => {
    set({ bkNextAddress });
  },
  logoutBitkubNext: async () => {
    set({
      bkNextAddress: null,
      bkNextPhone: null,
    });
    localService.removeItem(STORAGE_KEYS.BK_REFRESH_TOKEN);
    localService.removeItem(STORAGE_KEYS.BK_ACCESS_TOKEN);
    localService.removeItem(STORAGE_KEYS.WALLET_TYPE);
    localService.removeItem(STORAGE_KEYS.REFRESH_IV);
  },
});

type BKNextStore = ReturnType<typeof bkNextStore>;
const useBKNextStore = create<BKNextStore>(bkNextStore);

export default useBKNextStore;
