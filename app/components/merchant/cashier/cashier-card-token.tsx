import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Loading from "~/components/loading";
import { useNavigate } from "@remix-run/react";
import type { OrderID } from "~/type/order";
import TokenListbox from "~/components/ui/tokenListbox";
import { getTokenList } from "~/constants/tokens";
import { TokenType } from "~/type/token";
import { createOrder } from "~/api/order";
import { useTranslation } from "react-i18next";
import { formatNumber } from "~/utils/format";
import { encryptString } from "~/utils/crypto";
import { useManagerInfo, useManagerInfoById } from "~/hooks/useManagerInfo";
import { PaymentOutput } from "~/enums/payment-output";
import useCashierStore from "~/stores/cashier-store";
import { useFeeCustomProvider } from "~/hooks/useFeeCustomProvider";
import { MemberDetail } from "~/type/member";
import { FiatCurrencyType } from "~/type/currency";
import _ from "lodash";
import { useExchangeRate } from "~/hooks/use-exchange-rate";
import Big from "big.js";

const SECOND_TO_REFETCH = 60;
const SECOND_TO_SHOW_REFETCH = 15;

type PropsType = {
  cashierData: {
    user: MemberDetail;
    isExpired: boolean;
  };
  price: number;
  selectedCurrency: FiatCurrencyType;
  paymentOutput: PaymentOutput;
  isCashierId: boolean;
};

export default function CashierCardToken({
  cashierData,
  price,
  selectedCurrency,
  paymentOutput,
  isCashierId,
}: PropsType) {
  const [tokenList, setTokenList] = useState<TokenType[]>([]);
  const selectedChainId = useCashierStore((state) => state.selectedChainId);
  const getSelectedChain = useCashierStore((state) => state.getSelectedChain);

  const selectedChain = getSelectedChain();
  const { t } = useTranslation("index");

  const navigate = useNavigate();
  const [{ data: accountData }] = useAccount();

  const { managerData } = useManagerInfo(accountData?.address!);
  const { managerDetail: cashierManager } = useManagerInfoById(
    cashierData?.user?.managerId
  );

  const defaultToken = tokenList[0] || {};
  const [receiveToken, setReceiveToken] = useState(defaultToken as TokenType);

  const [
    exchangeRate,
    isFetchingExRate,
    setIsFetchingExRate,
    fetchRateDebounce,
  ] = useExchangeRate({
    selectedCurrency,
    price: price as number,
    receiveToken,
    tokenList,
    selectedChain,
  });

  // let selectedChain =
  //   !data.chain?.id || (data.chain?.id && data.chain?.unsupported)
  //     ? defaultChain.id
  //     : data.chain.id

  useEffect(() => {
    const selectedChain = getSelectedChain();
    setTokenList(getTokenList(selectedChain?.id));
  }, [selectedChainId]);

  const defaultTokenAddr = defaultToken ? defaultToken.tokenAddress : "";

  const [isCreateOrder, setIsCreateOrder] = useState(false);
  const [isFeeLoading, fee] = useFeeCustomProvider(selectedChain);
  let calPrice;
  let calReceive;
  if (price && exchangeRate.rate !== 0) {
    calPrice = Big(price).mul(Big(1).plus(Big(fee).div(Big(100))));
    calReceive = Big(price)
      .mul(Big(1).plus(Big(fee).div(Big(100))))
      .div(Big(exchangeRate.rate));
  }
  // (price*90)/100  specific for PHC requirement
  const calReceiveToken = Number(calReceive);
  // (price*90)/100  specific for PHC requirement
  const calPriceWithFee = price === 0 ? "0" : Number(calPrice);
  const [secondLeft, setSecondLeft] = useState(SECOND_TO_REFETCH);

  useEffect(() => {
    if (secondLeft > 0) {
      setTimeout(() => {
        setSecondLeft(secondLeft - 1);
      }, 1000);
    }
  }, [secondLeft]);

  const youWillReceive = () => {
    if (exchangeRate.rate === 0) {
      return null;
    } else {
      return (
        <div className="mt-0 flex justify-between">
          <p className="font-bold text-white">{t("you_will_receive")} </p>
          {receiveToken.tokenSymbol === "PHCP" ? (
            <p
              className={`font-bold text-white ${
                isFetchingExRate && "animate-pulse font-bold text-white"
              }`}
            >
              {`≈ ${formatNumber(calReceiveToken)}
      ${receiveToken?.tokenSymbol}`}
            </p>
          ) : (
            <p
              className={`font-bold text-white ${
                isFetchingExRate && "animate-pulse font-bold text-white"
              }`}
            >
              {`≈ ${formatNumber(calReceiveToken)}
        ${receiveToken?.tokenSymbol}`}
            </p>
          )}
        </div>
      );
    }
  };

  const displayTokens = tokenList.filter((token) => {
    // return token?.tokenSymbol === "BUSD" || token?.tokenSymbol === "USDT";

    // 30/11/2022 AFTER MEET k'Antonio fix display token only BUSD
    return token?.tokenSymbol === "BUSD";
  });
  const disabled =
    +price <= 0 ||
    fee == 0 ||
    isFetchingExRate ||
    secondLeft === 0 ||
    exchangeRate.rate === 0 ||
    isCreateOrder ||
    isFeeLoading;

  const handleCreateOrder = async () => {
    setIsCreateOrder(true);
    try {
      if (!price) return null;
      const manager = managerData ? managerData : cashierManager!;

      const content = JSON.stringify({
        price: calPriceWithFee.toString(),
        receiveToken: receiveToken?.tokenSymbol!,
        receiveTokenValue: calReceiveToken?.toString(),
        exchangeRate: exchangeRate.rate,
        currency: selectedCurrency.symbol,
        receiveFiatValue: price.toString(),
        merchantName: manager.name,
        networkId: JSON.stringify(selectedChain),
      });

      const createData = await createOrder({
        merchantAddress: manager.walletAddress,
        amountOut: +calReceiveToken,
        tokenSymbol: receiveToken?.tokenSymbol!,
        networkId: JSON.stringify(selectedChain),
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
    } catch (error) {
      console.error(error);
      setIsCreateOrder(false);
    }
  };

  useEffect(() => {
    if (defaultTokenAddr) {
      setReceiveToken(defaultToken);
    }
  }, [defaultTokenAddr]);

  // BUSD/THB = 33.71915482000001 | VALUE: 2.965080368500178
  // BUSD/PHC = 1.002005010021042086
  // RATE: PHC/THB = 33.71915482000001 * 1.002005010021042086 = 33.7867620633

  useEffect(() => {
    setIsFetchingExRate(true);
    fetchRateDebounce();
  }, [price, selectedCurrency.symbol, receiveToken.tokenSymbol]);

  return (
    <>
      <div className="">
        <form className="max-w-md">
          <div className="grid grid-cols-1 gap-6">
            {tokenList.length !== 0 && (
              <>
                <label
                  htmlFor="Select token to receive mb-0 pb-0"
                  className="block"
                >
                  <span className="mb-0 pb-0 text-primary-yellow">
                    {t("select_token_to_receive")}
                  </span>
                </label>
                <TokenListbox
                  selected={receiveToken}
                  setSelected={setReceiveToken}
                  tokens={displayTokens}
                />
                <p
                  className={`${
                    isFetchingExRate && "animate-pulse cursor-not-allowed"
                  } text-right font-bold text-white`}
                >
                  {t("rate", { rate: 1 })} {receiveToken?.tokenSymbol} ={" "}
                  {`${formatNumber(exchangeRate.rate, 5)}
                        `}
                  {selectedCurrency.symbol}
                </p>
                <div className="mt-0 flex justify-between text-white">
                  {receiveToken.tokenSymbol === "PHCP" ? (
                    <p className="font-bold text-white">
                      {t("price_with_discount", { discount: 10 })}
                    </p>
                  ) : (
                    <p className="font-bold text-white">{t("price")}</p>
                  )}
                  {receiveToken.tokenSymbol === "PHCP" ? (
                    <p className="font-bold text-white">
                      {(price * 90) / 100} {selectedCurrency.symbol}{" "}
                    </p>
                  ) : (
                    <p className="font-bold text-white">
                      {price} {selectedCurrency.symbol}{" "}
                    </p>
                  )}
                </div>
                <div className="mt-0 flex justify-between text-white">
                  <p className="font-bold text-white">
                    {t("price_with_fee", { fee })}
                  </p>
                  {receiveToken.tokenSymbol === "PHCP" ? (
                    <p className="font-bold text-white">
                      {formatNumber(calPriceWithFee)} {selectedCurrency.symbol}{" "}
                    </p>
                  ) : (
                    <p className="font-bold text-white">
                      {formatNumber(calPriceWithFee)} {selectedCurrency.symbol}{" "}
                    </p>
                  )}
                </div>
                {youWillReceive()}
              </>
            )}

            <button
              disabled={disabled || isCashierId}
              type="button"
              className="
                    inline-flex justify-center rounded-full border border-transparent bg-primary-yellow px-4 py-2 text-sm font-medium text-white 
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300
                    "
              onClick={handleCreateOrder}
            >
              {isCreateOrder || isFetchingExRate || isFeeLoading ? (
                <>
                  <Loading />
                  {t("processing")}...
                </>
              ) : (
                t("create_qr")
              )}
            </button>
            {secondLeft <= SECOND_TO_SHOW_REFETCH ? (
              <button
                type="button"
                className="
                      inline-flex justify-center rounded-full border border-transparent bg-primary-yellow px-4 py-2 text-sm font-medium text-[#0812F8] 
                      shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300
                      "
                disabled={secondLeft > 0}
                onClick={async () => {
                  setSecondLeft(SECOND_TO_REFETCH);
                  try {
                    setIsFetchingExRate(true);
                    await fetchRateDebounce();
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                {secondLeft === 0
                  ? t("refresh_price")
                  : `${t("refresh_price_in")} ${secondLeft}`}
              </button>
            ) : null}
            {isCashierId ? (
              <>
                <div>
                  <p>please add cashier for Create QR</p>
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
