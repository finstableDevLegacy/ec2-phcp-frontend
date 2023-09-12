import axios from "axios";
import { useEffect } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import STORAGE_KEYS from "~/constants/storage-key";
import localService from "~/services/localstorage";
import useAuthStore from "~/stores/auth-store";

interface Window {
  ethereum: any;
}

const TRANSCRYPT_BACKEND = ENV.TRANSCRYPT_BACKEND || "http://localhost:4001";

export const useManagerLogin = () => {
  const [
    {
      data: { connectors },
    },
    connect,
  ] = useConnect();
  const setManagerAccessToken = useAuthStore(
    (state) => state.setManagerAccessToken
  );
  const [{ data: accountData }, disconnect] = useAccount();
  const [{ data: signature, error: errorSignMessage }, signMessage] =
    useSignMessage();

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

  const api = () =>
    axios.create({
      baseURL: TRANSCRYPT_BACKEND,
    });

  const handleConnect = async () => {
    try {
      await connect(connectors?.[0]);
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

  const apiGetChallenge = () => {
    return api().get("/auth/challenge");
  };

  const apiSendSignature = (signature: string) => {
    return api().post("/auth/getaccesstoken", {
      signature,
    });
  };

  return handleConnect;
};
