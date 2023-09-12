import { useEffect, useState } from "react";
import { useNetwork, Chain, useProvider, useAccount } from "wagmi";
import { useNavigate } from "@remix-run/react";

import { FiatRateCal } from "~/utils/fiat-rate";
import { formatNumber } from "~/utils/format";
import { FiatCurrencyType } from "~/type/currency";
import { TokenType } from "~/type/token";
import { GetBestRateContentType } from "~/type/cashier/fiat-purchase-type";
import { getTokenList } from "~/constants/tokens";

import { useTrustedOrderList } from "~/hooks/use-trusted-order-list";
import { useExchangeRate } from "~/hooks/use-exchange-rate";
import useWalletStore from "~/stores/wallet-store";
import useAppStore from "~/stores/app-store";

import { getFiatCurrencyList } from "~/api/exchange-rate";

import WithdrawModal from "~/components/merchant/wallet/withdraw-modal";
import WithdrawCard from "~/components/merchant/withdraw/withdraw-card";
import LoadingIcon from "~/components/loading-icon";
import { Pagination } from "~/components/ui/Pagination";

type WithdrawPackageViewType = {
  amount: string;
  _symbol: string;
};

export default function WithdrawPackageView({
  amount,
  _symbol,
}: WithdrawPackageViewType) {
  const navigator = useNavigate();
  const [{ data: accountData }] = useAccount();
  const [{ data }] = useNetwork();
  const provider = useProvider();
  const tokenList = getTokenList(data.chain?.id!);
  const defaultToken = tokenList[0] || {};

  const balances = useWalletStore((state) => state.balances);
  const rateFiatToken = useAppStore((state) => state.rateFiatToken);
  const setAddress = useWalletStore((state) => state.setAddress);
  const address = useWalletStore((state) => state.address);
  const loadBalances = useWalletStore((state) => state.loadTokenBalances);
  const loadTokenPricesFiat = useAppStore((state) => state.loadTokenPricesFiat);
  const loadRateFiatToken = useAppStore((state) => state.loadRateFiatToken);
  const tokenPricesFiat = useAppStore((state) => state.tokenPricesFiat);

  const [balanceTHB, setBalanceTHB] = useState("-1");
  const [amountTarget, setAmountTarget] = useState<string>("");
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isTokenReady, setIsTokenReady] = useState<boolean>(true);
  const [amountModal, setAmountModal] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrencyType>({
    id: 134,
    name: "Thai Baht",
    symbol: "THB",
  });
  const [receiveTokenExchange, setReceiveDefaultTokenExchange] = useState(
    defaultToken as TokenType
  );
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [trustedOrderSelected, setTrustedOrderSelected] = useState<GetBestRateContentType>();
  const [currentPage, setCurrentPage] = useState(1);
  // Note: fetch trusted order list
  const [
    trustedOrderLists,
    isFetchTrustedOrder,
    setIsFetchTrustedOrder,
    setTrustedOrderReq,
    fiatRatePair,
  ] = useTrustedOrderList({
    page: "1",
    limit: "5",
    fiatName: "THB",
    tokenSymbol: "BUSD",
    chainId: (data?.chain?.id || 97).toString(),
    amount: "",
  });
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

  const closeModal = () => {
    setWithdrawOpen(false);
  };
  const openModal = (
    _amount: number,
    _tokenSymbol: string,
    item: GetBestRateContentType,
    exchangeRate: string
  ) => {
    setTrustedOrderSelected({ ...item, price: exchangeRate });
    setIsTokenReady(_tokenSymbol === "BUSD");
    setAmountModal(_amount);
    setTokenSymbol(_tokenSymbol);
    setWithdrawOpen(true);
  };
  const onPrev= () => {
    setCurrentPage(currentPage-1);
    setTrustedOrderReq({
      page: (currentPage-1).toString(),
      limit: "5",
      fiatName: "THB",
      tokenSymbol: "BUSD",
      chainId: (data?.chain?.id || 97).toString(),
      amount: amountTarget,
    });
  }
  const onNext= () => {
    setCurrentPage(currentPage+1);
    setTrustedOrderReq({
      page: (currentPage+1).toString(),
      limit: "5",
      fiatName: "THB",
      tokenSymbol: "BUSD",
      chainId: (data?.chain?.id || 97).toString(),
      amount: amountTarget,
    });
  }
  // Note: search withdraw order list
  const onSearchWithdraw = () => {
    setTrustedOrderReq({
      page: currentPage.toString(),
      limit: "5",
      fiatName: "THB",
      tokenSymbol: "BUSD",
      chainId: (data?.chain?.id || 97).toString(),
      amount: amountTarget,
    });
  };
  // Note: fetch account's balance
  useEffect(() => {
    setLoadingBalance(true);
    const fetchData = async () => {
      setAddress(accountData?.address!);
      Promise.all([
        await loadBalances(provider, data.chain?.id || 1),
        await loadTokenPricesFiat(data.chain?.id!, "USD")
      ]);
    };
    fetchData();
  }, [accountData?.address]);
  // Note: fetch Rate Price Fiat
  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(tokenPricesFiat).length) {
        await loadRateFiatToken(tokenPricesFiat, data.chain as Chain);
        const fiatCurrency = await getFiatCurrencyList();
        setSelectedCurrency(
          () => fiatCurrency?.find((c: any) => c.symbol === "THB")!
        );
        if ((defaultToken?.tokenSymbol?.length || 0) > 0) {
          const token = tokenList.filter(
            (item) => item.tokenSymbol === defaultToken.tokenSymbol
          )[0];
          setReceiveDefaultTokenExchange(token);
        }
        await fetchRateDebounce();
      }
    };
    fetchData();
  }, [tokenPricesFiat]);
  // Note: For switch token to fiat
  useEffect(() => {
    setLoadingBalance(true);
    const rateUSDT = rateFiatToken[receiveTokenExchange.tokenSymbol || "BUSD"];
    // setBalanceUSDT((rateUSDT * amount).toFixed(2));
    const rateUSDTToTHB = exchangeRate.rate;
    setBalanceTHB(
      (
        rateUSDT *
        +balances[receiveTokenExchange?.tokenSymbol as string] *
        rateUSDTToTHB
      ).toFixed(2)
    );
    if (
      rateUSDT *
      +balances[receiveTokenExchange?.tokenSymbol as string] *
      rateUSDTToTHB
    )
      setLoadingBalance(false);
  }, [rateFiatToken, isFetchingExRate]);
  useEffect(() => {
    if (amount) {
      setAmountTarget(amount);
    }
    if (_symbol) {
      const symbol = tokenList.filter((item) => item.tokenName === _symbol)[0];
      setReceiveDefaultTokenExchange(symbol);
    }
  }, [amount, _symbol]);
  useEffect(() => {
    const eth = (window as any).ethereum;
    eth.on("accountsChanged", async () => {
      const url = new URL((window as any).location.href);
      const fetchData = async () => {
        setAddress(accountData?.address!);
        Promise.all([
          await loadBalances(provider, data.chain?.id || 1),
          await loadTokenPricesFiat(data.chain?.id!, "USD")
        ]);
      };
      fetchData();
      if (url.pathname === '/merchant/manager/withdraw') {
        navigator("/merchant/manager/wallet");
      }
    });
  }, []);
  return (
    <>
      <WithdrawModal
        amountWallet={balanceTHB}
        isTokenReady={isTokenReady}
        symbol={tokenSymbol}
        isOpen={withdrawOpen}
        closeModal={closeModal}
        rateUSDToTHB={exchangeRate.rate}
        trustedOrderSelected={trustedOrderSelected}
      />
      <div className="flex justify-center">
        <div className="mt-7 flex w-full max-w-[600px] flex-col items-center space-y-3 p-3">
          <h1 className="text-2xl font-bold text-primary-yellow lg:text-3xl">
            {`Withdrawal with ${receiveTokenExchange.tokenName}`}
          </h1>
          {loadingBalance ? (
            <>
              <LoadingIcon />{" "}
            </>
          ) : (
            <>
              <div className="flex w-full flex-col items-center rounded-2xl border border-t border-white bg-primary-black-gray p-3">
                <div className="h-10 w-10 rounded-full">
                  <img
                    className="h-auto w-full object-cover"
                    src={receiveTokenExchange?.tokenLogoUri!}
                    alt={receiveTokenExchange?.tokenName}
                  />
                </div>
                <div className="text-sm font-bold text-white">
                  {receiveTokenExchange?.tokenName}
                </div>
                <div className="flex flex-col items-center md:flex-row md:space-x-2">
                  <div className="text-sm font-normal capitalize text-white">
                    <span>
                      {formatNumber(
                        (+balances[
                          receiveTokenExchange?.tokenSymbol as string
                        ]).toFixed(4)
                      )}
                    </span>{" "}
                    <span>{receiveTokenExchange?.tokenName}</span>
                  </div>
                  <div className="text-broker truncate text-sm text-primary-yellow">
                    {` (≈ ${formatNumber(balanceTHB)} THB)`}
                  </div>
                </div>
              </div>
              <div className="self-start text-sm font-bold text-white">
                Trusted Orders
              </div>
              <div className="flex w-full space-x-3">
                <input
                  type="number"
                  value={amountTarget}
                  placeholder="100"
                  onChange={(e) => setAmountTarget(e.target.value)}
                  className="w-full justify-center rounded-md border border-gray-400 px-4 py-2 text-sm text-black shadow-sm [appearance:textfield]
                          focus:border-yellow-400 focus:ring focus:ring-yellow-50 focus:ring-opacity-50"
                />
                <button
                  onClick={onSearchWithdraw}
                  className="h-full w-20 rounded bg-primary-yellow text-sm font-normal text-slate-900 shadow-pay-wallet"
                >
                  Search
                </button>
              </div>
              {isFetchTrustedOrder ? (
                <>
                  <LoadingIcon />{" "}
                </>
              ) : (
                <>
                  {trustedOrderLists.map((item, key) => {
                    const exchangeRate = FiatRateCal(fiatRatePair, item.margin);
                    return (
                      <WithdrawCard
                        key={key}
                        item={item}
                        exchangeRate={exchangeRate}
                        openModal={openModal}
                      />
                    );
                  })}
                  {/* <Pagination
                    currentPage={currentPage}
                    totalItems={trustedOrderLists.length}
                    itemPerPage={5}
                    onPrev={onPrev}
                    onNext={onNext}
                    onSelect={() => {}}
                  /> */}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
