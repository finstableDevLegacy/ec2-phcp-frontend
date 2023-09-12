import create from "zustand";
import { CashierProfile } from "~/type/cashier/cashier.type";
import STORAGE_KEYS from "~/constants/storage-key";
import localService from "~/services/localstorage";

const store = (set: any, get: any) => ({
  profile: null as CashierProfile | null,
  loginCashier: async (email: string, password: string) => { },
  setAddress: (address: string) => {
    set({ address });
  },
  logoutManager: () => {
    localService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    set({ managerAccessToken: "" })
  },
  managerAccessToken:
    localService.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  setManagerAccessToken: (token: string) => {
    set({ managerAccessToken: token })
  }

});

type AuthStore = ReturnType<typeof store>;
const useAuthStore = create<AuthStore>(store);

export default useAuthStore;
