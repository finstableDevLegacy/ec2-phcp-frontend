import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiatCurrencyType } from "~/type/currency";
import { getFiatPurchaseRate } from "~/api/merchant/fiat-purchase-rate";
import _ from "lodash";
import Loading from "~/components/loading";
import { useNavigate } from "@remix-run/react";
import { MemberDetail } from "~/type/member";
import { useAccount } from "wagmi";
import { useManagerInfo, useManagerInfoById } from "~/hooks/useManagerInfo";
import { createOrder } from "~/api/order";
import useCashierStore from "~/stores/cashier-store";
import { useFeeCustomProvider } from "~/hooks/useFeeCustomProvider";
import { PaymentOutput } from "~/enums/payment-output";
import { OrderID } from "~/type/order";
import { encryptString } from "~/utils/crypto";
import { getTokenList } from "~/constants/tokens";
import { formatNumber } from "~/utils/format";
import Big from "big.js";

type PropsType = {
  setSelectedPaymentOption: Dispatch<SetStateAction<PaymentOutput | null>>;
  selectedCurrency: FiatCurrencyType;
  price: number;
  cashierData: {
    user: MemberDetail;
    isExpired: boolean;
  };
  paymentOutput: PaymentOutput;
  isCashierId: boolean;
};

export default function CashierCardFiat({
  setSelectedPaymentOption,
  selectedCurrency,
  price,
  cashierData,
  paymentOutput,
  isCashierId,
}: PropsType) {
  const navigate = useNavigate();
  const { t } = useTranslation("index");
  const [isFetchingFiatRate, setIsFetchingFiatRate] = useState(false);
  const [fiatRate, setFiatRate] = useState<Number | null>(null);
  const [isShowSwitchToToken, setIsShowSwitchToToken] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [{ data: accountData }] = useAccount();

  const { managerData } = useManagerInfo(accountData?.address!);
  const { managerDetail: cashierManager } = useManagerInfoById(
    cashierData?.user?.managerId
  );

  const getSelectedChain = useCashierStore((state) => state.getSelectedChain);
  const chainId = getSelectedChain().id;
  const [isFeeLoading, fee] = useFeeCustomProvider(getSelectedChain());

  const getDefaultTokenByChainId = (chainId: number) => {
    return getTokenList(chainId).find((token) => token.tokenSymbol === "BUSD");
  };

  let calReceive;

  if (price) {
    calReceive = Big(price).mul(Big(1).plus(Big(fee).div(Big(100))));
  }
  const calPriceWithFee = price === 0 || null ? "0" : Number(calReceive);

  const callApiGetFiatPurchaseRate = async () => {
    try {
      const tokenSymbol = getDefaultTokenByChainId(chainId)?.tokenSymbol;

      if (!price) {
        throw new Error("invalid price");
      }
      if (tokenSymbol) {
        const rateFetch = await getFiatPurchaseRate(
          +price,
          `${chainId}`,
          selectedCurrency.symbol,
          tokenSymbol
        );
        if (!rateFetch?.price) {
          throw new Error("rate not found");
        }
        setFiatRate(rateFetch.price);
      }
    } catch (err) {
      setIsShowSwitchToToken(true);
      throw err;
    } finally {
      setIsFetchingFiatRate(false);
    }
  };

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const tokenSymbol = getDefaultTokenByChainId(chainId)?.tokenSymbol;
      if (!price) return null;
      const manager = managerData ? managerData : cashierManager!;
      const content = JSON.stringify({
        price: calPriceWithFee.toString(),
        receiveToken: getDefaultTokenByChainId(chainId)?.tokenSymbol,
        receiveTokenValue: 0,
        exchangeRate: 0,
        currency: selectedCurrency.symbol,
        receiveFiatValue: price.toString(),
        merchantName: manager.name,
        networkId: chainId,
      });
      if (tokenSymbol) {
        const createData = await createOrder({
          merchantAddress: manager.walletAddress,
          amountOut: 0,
          tokenSymbol: tokenSymbol,
          networkId: `${chainId}`,
          fee: fee.toString(),
          managerId: manager.id,
          content,
          paymentOutput,
          platformType: "phcp",
        });
        const paramsPayload: OrderID = {
          orderId: createData.data.id,
        };
        let params = new URLSearchParams(paramsPayload).toString();
        const encryptParams = encryptString(params);
        navigate({
          pathname: "/merchant/order/neworder",
          search: `?${encryptParams}`,
        });
      }
    } catch (error) {
      console.error(error);
      setIsCreatingOrder(false);
    }
  };

  useEffect(() => {
    if (!price || price === 0) {
      return;
    }
    const fetchFiatRateDebounce = _.debounce(callApiGetFiatPurchaseRate, 3000);

    const fetchFiatRate = async () => {
      setIsFetchingFiatRate(true);
      setIsShowSwitchToToken(false);
      await fetchFiatRateDebounce();
    };
    // setIsFetchingFiatRate(false);
    fetchFiatRate();
    return () => {
      fetchFiatRateDebounce.cancel();
    };
  }, [price]);

  // useEffect(() => {
  //   if (price && price !== 0 && !fiatRate && !isFetchingFiatRate) {
  //     setIsShowSwitchToToken(true);
  //     return;
  //   }
  // }, [price, fiatRate]);

  return (
    <>
      <div className="">
        <form className="max-w-md">
          <div className="grid grid-cols-1 gap-6 text-white">
            {isShowSwitchToToken ? (
              <div>
                <p>
                  fiat purchase not available for {price}{" "}
                  {selectedCurrency.symbol}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentOption(PaymentOutput.TOKEN);
                  }}
                  className="mt-1
                        inline-flex w-full justify-center rounded-md border border-transparent bg-primary-yellow px-4 py-2 text-sm font-medium 
                        text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300
                        "
                >
                  accept token
                </button>
              </div>
            ) : (
              <>
                <div className="mt-0 flex justify-between ">
                  <p className="font-bold text-white">
                    {t("price_with_fee", { fee })}
                  </p>
                  <p className="text-white">
                    {formatNumber(calPriceWithFee)} {selectedCurrency.symbol}{" "}
                  </p>
                </div>
                <button
                  disabled={
                    isFetchingFiatRate ||
                    !price ||
                    price === 0 ||
                    !fiatRate ||
                    fiatRate === 0 ||
                    isCashierId ||
                    isFetchingFiatRate ||
                    isCreatingOrder ||
                    isFeeLoading
                  }
                  type="button"
                  className="
                      inline-flex justify-center rounded-md border border-transparent bg-primary-yellow px-4 py-2 text-sm font-medium text-white 
                      shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300
                      "
                  onClick={handleCreateOrder}
                >
                  {isFetchingFiatRate || isCreatingOrder || isFeeLoading ? (
                    <Loading />
                  ) : (
                    t("create_qr")
                  )}
                </button>
              </>
            )}
            {isCashierId ? (
              <>
                <div>
                  <p>please add Cashier for create QR</p>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
