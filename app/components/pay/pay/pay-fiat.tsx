import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import { Link } from "@remix-run/react";
import { BigNumber, ContractTransaction, ethers } from "ethers";
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { Chain, useAccount, useConnect, useNetwork, useSigner } from "wagmi";
import { apiCreateMatchOrder } from "~/api/dealer/match-order.api";
import { apiUpdateOrderFiatPurchase } from "~/api/dealer/order.api";
import { apiUpdateDealerOrderId } from "~/api/dealer/update-dealer-order-id.api";
import { getFiatPurchaseRate } from "~/api/merchant/fiat-purchase-rate";
import { getAddressList } from "~/constants/address-list";
import { getBlockScanner } from "~/constants/block-scanner";
import STORAGE_KEYS from "~/constants/storage-key";
import { getTokenList } from "~/constants/tokens";
import { useApproveToken, useOrderStatus } from "~/hooks";
import {
  getAmountInWithPoolRate,
  getExactAmountInWithPoolRate,
} from "~/hooks/get-amount-in-with-pool-rate";
import { useAmountInWithPoolRate } from "~/hooks/use-amount-in-with-pool-rate";
import { usePoolRateCustomerPay } from "~/hooks/use-pool-rate-customer-pay";
import { usePoolRateSimple } from "~/hooks/use-pool-rate-simple";
import { useBalance } from "~/hooks/useBalance";
import localService from "~/services/localstorage";
import { MerchantOrder, OrderState, OrderStatus } from "~/type/order";
import { TokenType } from "~/type/token";
import { Transcrypt__factory } from "~/typechain";
import { formatNumber } from "~/utils/format";
import { getBNBToken } from "~/utils/get-bnb-token";
import { shorten } from "~/utils/shorten";
import ApproveToken from "~/components/approve-token";
import Countdown from "~/components/countdown";
import NetworkSwitcher from "~/components/layout/pay/wallet/network-switcher";
import Loading from "~/components/loading";
import LoadingIcon from "~/components/loading-icon";
import LoginModal from "~/components/login-modal";
import TokenListbox from "~/components/ui/tokenListbox";
import { useTokenAmount } from "~/hooks/pay/pay/pay-fait.hook";
import { getTxHashFiat, updateContentDiscountPercentage } from "~/api/order";
import { LightBulbIcon } from "@heroicons/react/outline";

type PropType = {
  orderFetched: MerchantOrder;
  chains: Chain[];
};

export default function PayFiat({ orderFetched, chains }: PropType) {
  const { t } = useTranslation("pay");
  const [{ data }] = useNetwork();
  const [payToken, setPayToken] = useState<TokenType>({});
  const [receiveToken, setReceiveToken] = useState<TokenType>({});
  const [isFetchingBalance, balance] = useBalance(payToken?.tokenSymbol ?? "");
  const [order, setOrder] = useState(orderFetched);
  const [amountIn, amountOut, fetchTokenAmount] = useTokenAmount(
    order,
    data,
    payToken,
    receiveToken
  );

  const { showApprove, fetchApproval } = useApproveToken(
    payToken?.tokenAddress!
  );
  const [isCountDownFinish, setIsCountDownFinish] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [{ data: accountData }] = useAccount();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [orderState, setOrderState] = useState<{
    status: OrderState;
    timestamp: string;
  }>({ status: "idle", timestamp: "" });
  const [startCountdownRefresh, setStartCountdownRefresh] = useState(false);
  const [countdownRefresh, setCountdownRefresh] = useState(10);
  const [, getSigner] = useSigner();
  const tokenList = getTokenList(data.chain?.id!);
  const isPayPHCP = () => {
    if (payToken?.tokenSymbol === "PHCP") {
      return (Number(order.price) * 9) / 10;
    } else {
      return Number(order.price);
    }
  };
  const tokenPrice = isPayPHCP();
  const isNotReadyToPay =
    amountIn.isLoading ||
    amountOut.isLoading ||
    !tokenPrice ||
    !amountIn.amount ||
    Number(tokenPrice) / Number(amountIn.amount) === Infinity;
  useEffect(() => {
    if (
      isCountDownFinish &&
      orderState.status !== OrderStatus.SUCCESS &&
      !isLoading
    ) {
      setOrderState({
        status: "expired",
        timestamp: new Date().toLocaleString(),
      });
    }
  }, [isCountDownFinish, orderState.status, isLoading]);
  useOrderStatus(order, setOrderState);
  useEffect(() => {
    if (!payToken?.tokenSymbol) {
      setPayToken(tokenList[0]);
    }
    if (!receiveToken?.tokenSymbol) {
      setReceiveToken(
        tokenList.find((token) => token?.tokenSymbol === order?.receiveToken) ||
          {}
      );
    }
  }, [data.chain?.id]);

  const disabled = countdownRefresh !== 0;

  const handlePay = async () => {
    if (!data?.chain?.id) {
      return;
    }
    try {
      setIsLoading(true);
      const bnbToken = getBNBToken(tokenList);
      const addressList = getAddressList(data.chain?.id!);
      const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const fiatRateBeforePay = await fetchTokenAmount();
      if (!fiatRateBeforePay?.id) {
        throw new Error("dealer not found");
      }
      await apiUpdateOrderFiatPurchase(
        order.orderId,
        fiatRateBeforePay.id,
        String(fiatRateBeforePay.price),
        accessToken
      );
      if (amountIn.amount === "0") return null;
      const signer = await getSigner();
      const transcrypt = Transcrypt__factory.connect(
        addressList["Transcrypt"],
        signer!
      );
      let tx: ContractTransaction;
      //เหรียญเดียวกันไม่ต้องเผื่อ amountInRefetched
      if (payToken === receiveToken) {
        tx = await transcrypt.purchase(
          Number(order.orderId),
          order.merchant,
          [payToken.tokenAddress!, receiveToken.tokenAddress!],
          parseUnits(amountIn.amount, payToken.tokenDecimal),
          parseUnits(amountOut.amount, receiveToken.tokenDecimal),
          order.deadline,
          fiatRateBeforePay.dealerAddress
        );
      } else {
        //คนละเหรียญเผื่อ amountIn
        //case phcp ต้องผ่าน bnb
        if (
          payToken?.tokenSymbol === "PHCP" ||
          receiveToken?.tokenSymbol === "PHCP"
        ) {
          tx = await transcrypt.purchase(
            Number(order.orderId),
            order.merchant,
            [
              payToken.tokenAddress!,
              bnbToken.tokenAddress!,
              receiveToken.tokenAddress!,
            ],
            parseUnits(`${amountIn.amountPlus}`, payToken.tokenDecimal),
            parseUnits(amountOut.amount, receiveToken.tokenDecimal),
            order.deadline,
            fiatRateBeforePay.dealerAddress
          );
          if (payToken.tokenSymbol === "PHCP") {
            await updateContentDiscountPercentage(order.orderId, "10");
          }
        } else {
          try {
            tx = await transcrypt.purchase(
              Number(order.orderId),
              order.merchant,
              [payToken.tokenAddress!, receiveToken.tokenAddress!],
              parseUnits(`${amountIn.amountPlus}`, payToken.tokenDecimal),
              parseUnits(amountOut.amount, receiveToken.tokenDecimal),
              order.deadline,
              fiatRateBeforePay.dealerAddress
            );
          } catch (err) {
            console.error("error purchase");
            throw err;
          }
        }
      }
      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (event) => event.event === "Purchased"
      );
      const receiptEvent = await getTxHashFiat(event as ethers.Event);

      if (event?.args && receipt?.transactionHash) {
        setOrder({
          ...order,
          transactionHash: `${getBlockScanner(data?.chain?.id)}/${
            receipt.transactionHash
          }`,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("e", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (startCountdownRefresh && countdownRefresh > 0) {
      setTimeout(() => setCountdownRefresh(countdownRefresh - 1), 1000);
    }
  }, [startCountdownRefresh, countdownRefresh]);

  useEffect(() => {
    if (orderState.status === OrderStatus.SUCCESS) {
      setStartCountdownRefresh(true);
    }
  }, [orderState.status]);
  const OrderPending = (): JSX.Element => {
    const displayTokenRate = `1 ${payToken?.tokenSymbol}: ${
      isNotReadyToPay
        ? "loading..."
        : (Number(tokenPrice) / Number(amountIn.amount)).toFixed(2)
    } ${order.currency}`;
    const isPoolNotFound = formatNumber(amountIn.amount) === "NaN";
    const renderTokenBalance = (): JSX.Element => {
      return (
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">{t("your_balance")}</h1>
          <p className="overflow-y-auto text-white">
            {isFetchingBalance || payToken?.tokenSymbol === undefined
              ? "loading..."
              : `${formatNumber(balance)} ${payToken?.tokenSymbol}`}
          </p>
        </div>
      );
    };
    const renderPaymentAmount = (): JSX.Element => {
      if (isPoolNotFound) {
        return (
          <p className="mt-5 text-center text-sm font-bold text-white">
            {t("please_choose_other_tokens")}
          </p>
        );
      }
      if (isNotReadyToPay) {
        return <></>;
      }
      return (
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">
            {t("payment_amount")}
          </h1>
          <p className="overflow-y-auto text-white">
            {payToken === receiveToken
              ? `${formatNumber(amountIn.amount)} ${
                  payToken?.tokenSymbol === undefined
                    ? ""
                    : payToken?.tokenSymbol
                }`
              : `≈ ${formatNumber(amountIn.amount)} ${
                  payToken?.tokenSymbol === undefined
                    ? ""
                    : payToken?.tokenSymbol
                }
                 - ${formatNumber(amountIn.amountPlus)} ${
                  payToken?.tokenSymbol === undefined
                    ? ""
                    : payToken?.tokenSymbol
                }`}
          </p>
        </div>
      );
    };

    const isUnsupportedNetwork = !chains.find(
      (chain) => chain.id === data.chain?.id
    );
    const url = `${location.pathname}${location.search}`;

    const renderPayButton = (): JSX.Element => {
      const isInsufficientBalance =
        Number(balance || 0) < Number(amountIn.amount || 0) ||
        Number(balance) === 0;
      if (isPoolNotFound) {
        return (
          <p className="mt-3 text-center text-white">
            please choose another token
          </p>
        );
      }
      if (isInsufficientBalance) {
        return (
          <p className="mt-3 text-center text-white">
            please choose another token
          </p>
        );
      }
      return (
        <div className="mt-2 flex justify-center">
          {showApprove ? (
            <ApproveToken token={payToken} onApprove={fetchApproval} />
          ) : (
            <button
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-yellow px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-yellow focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
              onClick={handlePay}
              disabled={
                isCountDownFinish ||
                showApprove ||
                amountIn.amount == "0" ||
                isInsufficientBalance ||
                isNotReadyToPay
              }
            >
              {isLoading ? (
                <>
                  <Loading />
                  {t("processing")}...
                </>
              ) : (
                t("pay")
              )}
            </button>
          )}
        </div>
      );
    };
    return (
      <>
        <h1 className="mt-4 mb-10 flex justify-center text-3xl font-extrabold tracking-tight text-gray-900">
          <span className="font-bold text-primary-yellow xl:inline">
            {t("payment")}
          </span>
        </h1>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-medium">
            <span className="text-sm font-bold text-white">
              {t("order")} #{order.orderId}
            </span>
          </h1>
          <Countdown
            message="Remaining time"
            deadline={order.deadline}
            isCountDownFinish={isCountDownFinish}
            setIsCountDownFinish={setIsCountDownFinish}
          />
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">
            {t("merchant_address")}
          </h1>
          <p className="overflow-y-auto text-right text-sm text-white">
            {order.merchantName} ({shorten(order.merchant)})
          </p>
        </div>

        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">{t("total")}</h1>
          <p className="text-sm text-white">
            {formatNumber(tokenPrice)} {order.currency}
          </p>
        </div>
        {!accountData?.address ? (
          <>
            <LoginModal
              redirectPath={url}
              isOpen={showLoginModal}
              setIsOpen={() => {}}
            />
            <div
              className="mt-3 inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-primary-yellow px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-yellow focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
              onClick={() => setShowLoginModal(true)}
            >
              {t("connect_wallet")}
            </div>
          </>
        ) : isUnsupportedNetwork ? (
          <>
            <NetworkSwitcher />
          </>
        ) : (
          <>
            <div className="mt-5 flex flex-col justify-between">
              <>
                <h1 className="mb-3 text-sm font-bold text-white">
                  {t("pay_with")}
                </h1>
                <TokenListbox
                  selected={payToken}
                  setSelected={setPayToken}
                  tokens={tokenList.filter(
                    (token) =>
                      token?.tokenSymbol !== "BNB" &&
                      token?.tokenSymbol !== "WIS"
                  )}
                  message={displayTokenRate}
                />
              </>
            </div>
            {renderTokenBalance()}
            {renderPaymentAmount()}
            {renderPayButton()}
          </>
        )}
      </>
    );
  };

  const OrderSuccess = () => {
    return (
      <>
        {order.transactionHash ? (
          <div>
            <h1 className="mb-10 flex justify-center text-3xl font-extrabold tracking-tight text-gray-900">
              <span className="font-bold text-primary-yellow xl:inline">
                {t("payment_successful")}
              </span>
            </h1>
            <div className="flex flex-col items-center justify-center">
              <CheckCircleIcon className="h-32 text-green-400" />
            </div>
            <div className="flex justify-between">
              <h1 className="text-2xl font-medium">
                <span className="text-sm font-bold text-white">
                  {t("order")} #{order.orderId}
                </span>
              </h1>
            </div>
            <div className="mt-5 flex justify-between">
              <h1 className="text-sm font-bold text-white">{t("status")}</h1>
              <p className="text-sm text-primary-yellow">{t("completed")}</p>
            </div>
            <div className="mt-5 flex justify-between">
              <h1 className="text-sm font-bold text-white">
                {t("merchant_address")}
              </h1>
              <p className="overflow-y-auto text-right text-sm text-white">
                {order.merchantName} ({shorten(order.merchant)})
              </p>
            </div>
            <div className="mt-5 flex justify-between">
              <h1 className="text-sm font-bold text-white">{t("total")}</h1>
              <p className="text-sm text-white">
                {formatNumber(tokenPrice)} {order.currency}
              </p>
            </div>

            <div className="mt-5 flex justify-between">
              <h1 className="text-sm font-bold text-white">
                {t("paid_amount")}
              </h1>
              <p className="overflow-y-auto text-sm text-white">
                {Number(amountIn) !== 0
                  ? formatNumber(amountIn.amount)
                  : formatNumber(order.payAmount)}{" "}
                {payToken.tokenSymbol}
              </p>
            </div>
            <div className="mt-5 flex justify-center text-white">
              <p>{orderState.timestamp}</p>
            </div>
            <div className="mt-5 flex justify-between">
              <button className="h-10 rounded-md border border-primary-yellow bg-white px-6 font-medium text-primary-yellow transition-colors hover:bg-primary-yellow hover:text-white">
                <a href={order.transactionHash} target="_blank">
                  {t("view_on_block_explorer")}
                </a>
              </button>
              <button className="h-10 rounded-md bg-primary-yellow px-6 font-medium text-white transition-colors hover:border hover:border-primary-yellow hover:bg-white hover:text-primary-yellow">
                <Link to="/pay/history">{t("back")}</Link>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ProcessingTransaction />
          </div>
        )}
      </>
    );
  };

  const ProcessingTransaction = () => {
    return (
      <>
        <div>
          <div className="text-center">
            <h1 className="mb-10 flex justify-center text-3xl font-extrabold tracking-tight text-gray-900">
              <span className="font-bold text-primary-yellow xl:inline">
                {t("processing_transaction")}
              </span>
            </h1>
            <div className="flex h-52 items-center justify-center">
              <div className="">
                <div className="flex justify-center">
                  <LoadingIcon />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center text-center text-primary-yellow">
            <div className="mt-5 flex items-center justify-center rounded-md  border-2 border-transparent border-yellow-400 bg-yellow-50 px-3 py-2 text-xs font-medium text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light-blue focus:ring-offset-2">
              <LightBulbIcon className="mr-2 w-6 text-yellow-400" />
              <p>{t("try_refresh")}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col items-center justify-center">
            <button
              disabled={disabled}
              onClick={() => {
                window.location.reload();
              }}
              className="
                    inline-flex justify-center rounded-full border border-transparent bg-primary-yellow px-4 py-2 text-sm font-medium text-white 
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300
                    "
            >
              <p>{t("refresh")}</p>
              {countdownRefresh !== 0 ? (
                <div className="text-center text-sm">({countdownRefresh})</div>
              ) : null}
            </button>
          </div>
        </div>
      </>
    );
  };

  const OrderExpire = () => {
    return (
      <>
        <h1 className="mb-10 flex justify-center text-3xl font-extrabold tracking-tight text-gray-900">
          <span className="font-bold text-primary-yellow xl:inline">
            {t("payment_expired")}
          </span>
        </h1>
        <div className="flex flex-col items-center justify-center">
          <ClockIcon className="h-32 text-red-500" />
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-2xl font-medium">
            <span className="text-sm font-bold text-primary-yellow">
              {t("order")} #{order.orderId}
            </span>
          </h1>
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">{t("status")}</h1>
          <p className="text-sm text-red-500">{t("expired")}</p>
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">
            {t("merchant_address")}
          </h1>
          <p className="overflow-y-auto text-right text-sm text-white">
            {order.merchantName} ({shorten(order.merchant)})
          </p>
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">{t("total")}</h1>
          <p className="text-sm text-white">
            {formatNumber(tokenPrice)} {order.currency}
          </p>
        </div>
        <div className="mt-5 flex justify-center">
          <p className="text-sm text-white">{orderState.timestamp}</p>
        </div>
        <div className="mt-5 flex justify-center">
          <button className="h-10 rounded-md bg-primary-yellow px-6 font-medium text-white transition-colors hover:border hover:border-primary-yellow hover:bg-white hover:text-primary-yellow">
            <Link to="/pay/history">{t("back")}</Link>
          </button>
        </div>
      </>
    );
  };

  const OrderFailed = () => {
    return (
      <>
        <h1 className="mb-10 flex justify-center text-3xl font-extrabold tracking-tight text-gray-900">
          <span className="font-bold text-primary-yellow xl:inline">
            {t("payment_failed")}
          </span>
        </h1>
        <div className="flex flex-col items-center justify-center">
          <XCircleIcon className="h-32 text-red-500" />
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-2xl font-medium">
            <span className="text-sm font-bold text-primary-yellow">
              {t("order")} #{order.orderId}
            </span>
          </h1>
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">{t("status")}</h1>
          <p className="text-sm text-red-500">{t("failed")}</p>
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">
            {t("merchant_address")}
          </h1>
          <p className="overflow-y-auto text-right text-sm text-white">
            {order.merchantName} ({shorten(order.merchant)})
          </p>
        </div>
        <div className="mt-5 flex justify-between">
          <h1 className="text-sm font-bold text-white">{t("total")}</h1>
          <p className="text-sm text-white">
            {formatNumber(tokenPrice)} {order.currency}
          </p>
        </div>
        <div className="mt-5 flex justify-center">
          <p className="text-sm text-white">{orderState.timestamp}</p>
        </div>
        <div className="mt-5 flex justify-center">
          <button className="h-10 rounded-md bg-primary-yellow px-6 font-medium text-white transition-colors hover:border hover:border-primary-yellow hover:bg-white hover:text-primary-yellow">
            <Link to="/pay/history">{t("back")}</Link>
          </button>
        </div>
      </>
    );
  };

  const renderByStatus = (): JSX.Element => {
    if (orderState.status === OrderStatus.IDLE) {
      return (
        <div className="flex h-52 items-center justify-center">
          <LoadingIcon />
        </div>
      );
    }
    if (orderState.status === OrderStatus.EXPIRED) {
      return <OrderExpire />;
    }
    //ถ้ายังไม่มี txHash แสดงว่ายังไม่ยิง api ไป trading pool ให้แสดง pending ไปก่อน
    if (orderState.status === OrderStatus.PENDING) {
      return <OrderPending />;
    }
    if (orderState.status === OrderStatus.SUCCESS) {
      return <OrderSuccess />;
    }

    if (orderState.status === OrderStatus.FAILED) {
      return <OrderFailed />;
    }

    return <></>;
  };

  return (
    <div className="flex items-center justify-center gap-10">
      <div className=" wallet-pay  z-20 mt-16 border border-primary-black-gray p-8 shadow-md md:w-96">
        <div className="w-80 max-w-md">
          <div className="grid grid-cols-1">{renderByStatus()}</div>
        </div>
      </div>
    </div>
  );
}
