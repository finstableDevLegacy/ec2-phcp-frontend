import axios from "axios";
import { useEffect } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { api } from "~/api/base-url";
import STORAGE_KEYS from "~/constants/storage-key";
import localService from "~/services/localstorage";
import useAuthStore from "~/stores/auth-store";

interface Window {
  ethereum: any;
}

export const useWalletConnectLogin = () => {
  const [{ data: accountData, error: err }, disconnect] = useAccount();
  const [{ data: signature, error: errorSignMessage }, signMessage] =
    useSignMessage();
  const setManagerAccessToken = useAuthStore(
    (state) => state.setManagerAccessToken
  );

  if (typeof window !== "undefined") {
    (window as any).global = window;
    global.Buffer = global.Buffer || require("buffer").Buffer;
    (window as any).process = {
      version: "",
    };
  }

  useEffect(() => {
    const getSignature = async () => {
      const {
        data: { accessToken },
      } = await apiSendSignature(signature as string);

      setManagerAccessToken(accessToken);
      localService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    };
    if (signature) {
      getSignature();
    }
  }, [signature]);

  const signWalletConnect = async () => {
    try {
      const { data: challenge } = await apiGetChallenge();
      await signMessage({
        message: challenge,
      });
    } catch (error) {
      disconnect();
      setManagerAccessToken("");
      localService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  };
  useEffect(() => {
    if (accountData?.address) {
      signWalletConnect();
    }
  }, [accountData?.address]);

  const apiGetChallenge = () => {
    return api().get("/auth/challenge");
  };

  const apiSendSignature = (signature: string) => {
    return api().post("/auth/getaccesstoken", {
      signature,
    });
  };

  // return connectData;
  return signWalletConnect;
};
