import { LoaderFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chain, useAccount, useNetwork, useProvider } from "wagmi";
import { Tab } from "@headlessui/react";

import LoadingIcon from "~/components/loading-icon";
import WalletView from "~/components/views/manager/wallet";
import { getChains } from "~/config/network";
import useAppStore from "~/stores/app-store";
import useWalletStore from "~/stores/wallet-store";
import MenuSocial from "~/components/landing/MenuSocial";
import ContactUs from "~/components/landing/ContactUs";

import { getTokenList } from "~/constants/tokens";
import { getFiatCurrencyList } from "~/api/exchange-rate";

import { FiatCurrencyType } from "~/type/currency";
import { TokenType } from "~/type/token";

import { useExchangeRate } from "~/hooks/use-exchange-rate";


export type ManagerWalletLoaderData = {
  chains: Chain;
};
export let handle = {
  i18n: ["wallet"],
};

export const loader: LoaderFunction = async ({ request }) => {
  const { chains } = getChains(process.env.ENV);
  return {
    chains,
  };
};

export default function WalletPage() {
  const { t } = useTranslation("wallet");
  const [{ data: accountData }] = useAccount();
  const setAddress = useWalletStore((state) => state.setAddress);
  const loadBalances = useWalletStore((state) => state.loadTokenBalances);
  const loadTokenPrice = useAppStore((state) => state.loadTokenPrices);
  const loadTokenPricesFiat = useAppStore((state) => state.loadTokenPricesFiat);
  const tokenPricesFiat = useAppStore((state) => state.tokenPricesFiat);
  const loadRateFiatToken = useAppStore((state) => state.loadRateFiatToken);
  const rateFiatToken = useAppStore((state) => state.rateFiatToken);
  const provider = useProvider();
  const [{ data }] = useNetwork();
  const [loading, setLoading] = useState(true);
  const [tabSelected, setTabSelected] = useState<string>("wallet");

  const tokenList = getTokenList(data.chain?.id!);
  const balances = useWalletStore((state) => state.balances);
  const defaultToken = tokenList[0] || {};
  const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrencyType>({id: 134, name: 'Thai Baht', symbol: 'THB'});
  const [receiveTokenExchange, setReceiveDefaultTokenExchange] = useState(defaultToken as TokenType);

  const [
    exchangeRate,
    isFetchingExRate,
    setIsFetchingExRate,
    fetchRateDebounce,
  ] = useExchangeRate({
    selectedCurrency,
    price: +balances[defaultToken.tokenSymbol as string] as number,
    receiveToken: receiveTokenExchange, // BUSD
    tokenList,
    selectedChain: data?.chain as Chain,
  });

  useEffect(() => {
    setLoading(true);
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
        const fiatCurrency = await getFiatCurrencyList();
        setSelectedCurrency(() => fiatCurrency?.find((c: any) => c.symbol === "THB")!);
        if ((defaultToken?.tokenSymbol?.length || 0) > 0) {
          const token = tokenList.filter((item) => item.tokenSymbol === defaultToken.tokenSymbol)[0];
          setReceiveDefaultTokenExchange(token);
        }
        await fetchRateDebounce();
      }
    };
    fetchData();
  }, [tokenPricesFiat]);

  useEffect(() => {
    if (exchangeRate?.rate !== 0 && rateFiatToken?.USDT) setLoading(false);
  }, [isFetchingExRate, rateFiatToken]);

  return (
    <div className="z-50 h-full w-full">
      <>
        <div className="mx-auto mt-14 mb-3 flex h-auto w-full flex-col items-center">
          <Tab.Group>
            <Tab.List className="flex rounded-full bg-primary-black-gray p-1 w-full max-w-[350px]">
              <Tab
                className={`text-md w-full rounded-full rounded-r-none p-3 font-medium leading-5
                  ring-yellow-400 ring-opacity-60 ring-offset-2 ring-offset-yellow-400
                  ${
                    tabSelected === "wallet"
                      ? "bg-yellow-500 text-white"
                      : "bg-primary-black-gray text-slate-900 hover:bg-yellow-50 hover:bg-opacity-25"
                  }`}
                onClick={() => setTabSelected("wallet")}
              >
                Wallet
              </Tab>
              <Tab
                className={
                  `w-full rounded-full rounded-l-none p-3 text-md font-medium leading-5
                  ring-yellow-400 ring-opacity-60 ring-offset-2 ring-offset-yellow-400
                  ${(tabSelected === "history") ? "bg-yellow-500 text-white": "bg-primary-black-gray text-slate-900 hover:bg-yellow-50 hover:bg-opacity-25"}`
                }
                onClick={() => setTabSelected('history')}
              >
                Withdraw History
              </Tab>
            </Tab.List>
          </Tab.Group>
          {!loading ? (
            <WalletView tabSelected={tabSelected} rateUSDToTHB={exchangeRate.rate} />
          ) : (
            <div className="py-4 flex-1">
              <LoadingIcon />{" "}
            </div>
          )}
        </div>
        <div className="flex flex-row items-baseline justify-evenly">
          <div className="md:mt-30 lg:mt-30 mt-20 flex flex-row items-center justify-center p-5 pb-5 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xl font-light text-primary-yellow">
                {t("follow_us")}
              </h3>
              <MenuSocial />
            </div>
          </div>
          <div className="flex flex-row items-center p-5 pb-5 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xl font-light text-primary-yellow">
                {t("assistant")}
              </h3>
              <ContactUs />
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
