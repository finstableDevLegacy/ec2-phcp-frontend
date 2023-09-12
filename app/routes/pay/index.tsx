import { Chain, useAccount } from "wagmi";
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import LoginModal from "~/components/login-modal";
import { useProvider, useNetwork } from "wagmi";
import AssetBalance from "~/components/asset-balance";
import LoadingIcon from "~/components/loading-icon";
import useWalletStore from "~/stores/wallet-store";
import { getTokenList } from "../../constants/tokens";
import useAppStore from "../../stores/app-store";
import { useTranslation } from "react-i18next";

export let handle = {
  i18n: ["pay"],
};

export default function PayIndex() {
  const { t } = useTranslation("pay");
  const [{ data: accountData }] = useAccount();
  const isConnect = accountData?.address;
  const [isWalletOpen, setIsWalletOpen] = useState(true);
  const location = useLocation();
  const provider = useProvider();
  const [{ data: networkData }] = useNetwork();
  const balances = useWalletStore((state) => state.balances);
  const setAddress = useWalletStore((state) => state.setAddress);
  const loadBalances = useWalletStore((state) => state.loadTokenBalances);
  const loadTokenPrice = useAppStore((state) => state.loadTokenPrices);
  const loadTokenPricesFiat = useAppStore((state) => state.loadTokenPricesFiat);
  const tokenPricesFiat = useAppStore((state) => state.tokenPricesFiat);
  const loadRateFiatToken = useAppStore((state) => state.loadRateFiatToken);
  const [loading, setLoading] = useState(true);

  const [{ data }] = useNetwork();
  const isUnsupportedNetwork =
    !networkData.chain || networkData.chain.unsupported;

  useEffect(() => {
    const fetchData = async () => {
      setAddress(accountData?.address!);
      await loadBalances(provider, data.chain?.id || 1);
      await loadTokenPricesFiat(data.chain?.id!, "USD");
    };
    fetchData();
  }, [accountData?.address]);

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(tokenPricesFiat).length) {
        await loadRateFiatToken(tokenPricesFiat, data.chain as Chain);
        setLoading(false);
      }
    };
    fetchData();
  }, [tokenPricesFiat]);

  const tokenList = getTokenList(networkData.chain?.id!);

  const handleFilterToken = tokenList.filter(
    (token) => token.tokenSymbol !== "BNB" && token.tokenSymbol !== "WIS"
  );

  return (
    <div className="z-50 h-full w-full">
      {isConnect ? (
        <>
          <div className="wallet-pay border-primary-gray bg-primary-gray m-5 mx-auto flex h-auto w-full max-w-[400px] flex-col items-center rounded-2xl p-6 shadow-pay-wallet">
            <p className="text text-2xl font-bold text-primary-yellow">
              {t("wallet")}
            </p>

            {isUnsupportedNetwork ? (
              <div className="mt-4 text-white">
                {t("please_change_network")}
              </div>
            ) : !loading ? (
              <>
                <div className="mt-5 flex w-full justify-between font-bold">
                  <div className="text-primary-yellow">Assets</div>
                  <div className="hidden text-primary-yellow md:flex">
                    {t("balances")}
                  </div>
                </div>
                <div className="mt-4 w-full">
                  {handleFilterToken
                    .filter((token) => token?.tokenSymbol !== "BNB")
                    .map((item, idx) => {
                      return (
                        <AssetBalance
                          tokenUri={item.tokenLogoUri!}
                          amount={+balances[item.tokenSymbol as string]}
                          name={item.tokenName as string}
                          symbol={item.tokenSymbol as string}
                          key={idx}
                        />
                      );
                    })}
                </div>
                <div className="mt-2">
                  <Link
                    to="/pay/scanqr"
                    className="text-md rounded-full bg-primary-yellow px-5 pb-2 pt-1 text-white hover:border-2 hover:border-primary-yellow hover:bg-transparent hover:text-primary-yellow"
                  >
                    {t("scan_qr")}
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-4">
                <LoadingIcon />{" "}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="w-50">
            <img
              src="/assets/phc_logo.png"
              alt="transcrypt logo"
              className="h-52"
            />
          </div>
          <LoginModal
            redirectPath={location.pathname}
            isOpen={isWalletOpen}
            setIsOpen={setIsWalletOpen}
          />
        </div>
      )}
    </div>
  );
}
