import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { MerchantOrder, OrderState, OrderStatus } from "~/type/order";
import QRCode from "react-qr-code";
import Countdown from "~/components/countdown";
import { shorten } from "~/utils/shorten";
import {
  CheckCircleIcon,
  LightBulbIcon,
  RefreshIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import LoadingIcon from "~/components/loading-icon";
import { useTranslation } from "react-i18next";
import { encryptString, parseEncryptURL } from "~/utils/crypto";
import { formatNumber } from "~/utils/format";
import { useMerchantOrderStatus } from "~/hooks/useMerchantOrderStatus";
import { getChains } from "~/config/network";
import { Chain } from "wagmi";
import { getOrderFilter } from "~/api/order";
import { mapMerchantOrder } from "~/utils/order";
import { PaymentOutput } from "~/enums/payment-output";
import SuccessCashierToken from "~/components/merchant/order/neworder/success-cashier-token";
import { useOrderStatus } from "~/hooks";
import ClockIcon from "@heroicons/react/outline/ClockIcon";

type LoaderData = {
  order: MerchantOrder;
  appURL: {
    path: string;
    metamask: string;
  };
  chains: Chain[];
};

export let handle = {
  i18n: ["neworder"],
};

export const loader: LoaderFunction = async ({ request }) => {
  const { parseURL } = parseEncryptURL(request.url);

  const isOrderId = parseURL.searchParams.has("orderId");

  if (!isOrderId) return redirect("/merchant");

  const orderId = parseURL.searchParams.get("orderId")!;

  const { chains } = getChains(process.env.ENV);

  const result = await getOrderFilter([["id", orderId]]);

  const order = mapMerchantOrder(result);

  let rawURL = request.url.replace("merchant/order/neworder", "pay/pay");
  let appURL = {
    path: rawURL,
    metamask: rawURL,
  };

  return {
    order,
    appURL,
    chains,
  };
};

export default function NewOrder() {
  const { t } = useTranslation("neworder");
  const { order, appURL, chains } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [isCountDownFinish, setIsCountDownFinish] = useState(false);
  const orderIdURL = encryptString(`orderId=${order.orderId}`);
  const feePrice = Number(order.fee);
  const feeDisplay = `${formatNumber(
    (Number(order.receiveFiatValue) * feePrice) / 100
  )}`;

  const [orderState, setOrderState] = useState<{
    status: OrderState;
    timestamp: string;
  }>({ status: "idle", timestamp: "" });
  const amountOut = useMerchantOrderStatus(
    order,
    setOrderState,
    chains,
    isCountDownFinish
  );
  const [amount, setAmouut] = useState(amountOut);
  useEffect(() => {
    if (window.location.pathname !== "/merchant/order/neworder") {
      localStorage.removeItem("amountOutAsNumber");
    } else {
      getValueofStorage();
    }
  }, [order.receiveFiatValue, order.receiveTokenValue]);

  useEffect(() => {
    if (isCountDownFinish) {
      setOrderState({
        status: "expired",
        timestamp: orderState.timestamp,
      });
    }
  }, [isCountDownFinish]);

  const getValueofStorage = async () => {
    const amoutAsResult = await localStorage.getItem("amountOutAsNumber");
    setAmouut(Number(amoutAsResult));
  };

  const renderByOrderStatus: () => JSX.Element = () => {
    if (order.paymentOutput === PaymentOutput.FIAT) {
      return (
        <div className="mt-8 max-w-md">
          {orderState.status === OrderStatus.IDLE ? (
            <div className="flex h-52 items-center justify-center">
              <LoadingIcon />
            </div>
          ) : orderState.status === OrderStatus.PENDING ? (
            <div className="grid grid-cols-1 gap-5">
              <div>
                <div className="mt-5 flex justify-between">
                  <h1 className="text-sm font-bold text-white">
                    {t("merchant_name")}
                  </h1>
                  <span className="text-white">{order.merchantName}</span>
                </div>
                <div className="mt-5 flex justify-between">
                  <h1 className="text-sm font-bold text-white">
                    {t("merchant_address")}
                  </h1>
                  <p className="overflow-y-auto text-white">
                    {shorten(order.merchant)}
                  </p>
                </div>
                <div className="mt-5 flex justify-between">
                  <h1 className="text-sm font-bold text-white">
                    {t("product_price")}
                  </h1>
                  <p className="text-white">
                    {formatNumber(order.receiveFiatValue)} {order.currency}
                  </p>
                </div>
                <div className="mt-5 flex justify-between">
                  <h1 className="text-sm font-bold text-white">{t("fee")}</h1>
                  <p className="text-white">
                    {formatNumber(feeDisplay)} {order.currency}
                  </p>
                </div>
              </div>
              <div className="justify-cente flex flex-col items-center bg-white">
                <QRCode
                  value={appURL.metamask}
                  className="m-2 sm:m-2 md:m-5 lg:m-5 xl:m-5 2xl:m-5"
                />
              </div>
              <div className="m-3 flex justify-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appURL.path);
                  }}
                  className="rounded-md border border-transparent border-primary-yellow px-3 py-2 text-xs font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
                >
                  {t("copy_payment_url")}
                </button>
                {/* {appURL.path} */}
              </div>
              <Countdown
                message="This order will be expired in "
                deadline={order.deadline}
                isCountDownFinish={isCountDownFinish}
                setIsCountDownFinish={setIsCountDownFinish}
              />

              <div className="flex justify-center">
                <Link
                  to="/merchant/cashier"
                  className="inline-flex justify-center rounded-md border border-transparent border-primary-yellow px-10 py-2 text-sm font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
                >
                  {t("close")}
                </Link>
              </div>
            </div>
          ) : orderState.status === OrderStatus.SUCCESS ? (
            <div className="flex flex-col items-center justify-center">
              <CheckCircleIcon className="h-32 text-primary-yellow" />
              <p className="text-xl font-bold text-white">order paid</p>
              <p className="mt-3 text-sm text-white">
                {t("you_recevied")} {formatNumber(amount)} {order?.receiveToken}
              </p>
              <p className="text-white">converting to fiat you can leave now</p>
              <button
                onClick={() => {
                  navigate("/merchant/cashier");
                }}
                className="mt-5 rounded-md border border-transparent border-primary-yellow px-3 py-2 text-xs font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
              >
                back to cashier
              </button>
            </div>
          ) : orderState.status === OrderStatus.DEALER_COMPLETE ? (
            <div className="flex flex-col items-center justify-center">
              <CheckCircleIcon className="h-32 text-primary-yellow" />
              <p className="text-xl font-bold text-white">
                {t("order_completed")}
              </p>
              <p className="mt-3 text-sm text-white">
                {t("you_recevied")} {order.receiveFiatValue} {order.currency}
              </p>
              <Link
                className="mt-3 text-sm font-light text-primary-yellow underline underline-offset-1"
                //todo add go to page for fiat order
                to={`/`}
              >
                {t("view_detail")}
              </Link>
            </div>
          ) : orderState.status === OrderStatus.FAILED ? (
            <div>
              <div className="flex flex-col items-center justify-center">
                <XCircleIcon className="h-32 text-red-500" />
                <p className="text-primary-yellow">{t("order_was_failed")}</p>
                <div className="my-5 flex justify-center">
                  <Link
                    to="/merchant/cashier"
                    className="inline-flex justify-center rounded-md border border-transparent border-primary-yellow px-10 py-2 text-sm font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
                  >
                    {t("close")}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center justify-center">
                <ClockIcon className="h-32 text-red-500" />
                <p className="text-primary-yellow">{t("order_was_expired")}</p>
                <div className="my-5 flex justify-center">
                  <Link
                    to="/merchant/cashier"
                    className="inline-flex justify-center rounded-md border border-transparent border-primary-yellow px-10 py-2 text-sm font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
                  >
                    {t("close")}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="mt-8 max-w-md">
          {orderState.status === OrderStatus.IDLE ? (
            <div className="flex h-52 items-center justify-center">
              <LoadingIcon />
            </div>
          ) : orderState.status === OrderStatus.PENDING ? (
            <div className="grid grid-cols-1 gap-5">
              <div>
                <div className="mt-5 flex justify-between">
                  <h1 className="text-sm font-bold text-white">
                    {t("merchant_name")}
                  </h1>
                  <span className="text-white">{order.merchantName}</span>
                </div>
                <div className="mt-5 flex justify-between">
                  <h1 className="text-sm font-bold text-white">
                    {t("merchant_address")}
                  </h1>
                  <p className="overflow-y-auto text-white">
                    {shorten(order.merchant)}
                  </p>
                </div>
                <div className="mt-5 flex justify-between">
                  <h1 className="text-sm font-bold text-white">
                    {t("product_price")}
                  </h1>
                  <p className="text-white">
                    {formatNumber(order.receiveFiatValue)} {order.currency}
                  </p>
                </div>
                <div className="mt-5 flex justify-between">
                  <h1 className="text-sm font-bold text-white">{t("fee")}</h1>
                  <p className="text-white">
                    {formatNumber(feeDisplay)} {order.currency}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white ">
                <QRCode
                  value={appURL.metamask}
                  className="m-2 sm:m-2 md:m-5 lg:m-5 xl:m-5 2xl:m-5"
                />
              </div>
              <div>
                <div className="m-3 flex justify-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appURL.path);
                    }}
                    className="rounded-md border border-transparent border-primary-yellow px-3 py-2 text-xs font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
                  >
                    {t("copy_payment_url")}
                  </button>
                </div>
                <Countdown
                  message="This order will be expired in "
                  deadline={order.deadline}
                  isCountDownFinish={isCountDownFinish}
                  setIsCountDownFinish={setIsCountDownFinish}
                />
              </div>
              <div className="flex items-center justify-center rounded-md border border-transparent border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-medium text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light-blue focus:ring-offset-2">
                <div className="w-10">
                  <LightBulbIcon className="mr-3 w-6 text-yellow-300" />
                </div>
                <p>{t("refresh")}</p>
              </div>
              <div className="flex justify-center">
                <Link
                  to="/merchant/cashier"
                  className="inline-flex justify-center rounded-md border border-transparent border-primary-yellow px-10 py-2 text-sm font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
                >
                  {t("close")}
                </Link>
              </div>
            </div>
          ) : orderState.status === OrderStatus.SUCCESS ? (
            <div className="flex flex-col items-center justify-center">
              <SuccessCashierToken
                amountOutFromEvent={amountOut}
                orderIdURL={orderIdURL}
                orderId={order.orderId}
              />
            </div>
          ) : orderState.status === OrderStatus.FAILED ? (
            <div>
              <div className="flex flex-col items-center justify-center">
                <XCircleIcon className="h-32 text-red-500" />
                <p className="text-primary-yellow">{t("order_was_failed")}</p>
                <div className="my-5 flex justify-center">
                  <Link
                    to="/merchant/cashier"
                    className="inline-flex justify-center rounded-md border border-transparent border-primary-yellow px-10 py-2 text-sm font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
                  >
                    {t("close")}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center justify-center">
                <ClockIcon className="h-32 text-red-500" />
                <p className="text-primary-yellow">{t("order_was_expired")}</p>
                <div className="my-5 flex justify-center">
                  <Link
                    to="/merchant/cashier"
                    className="inline-flex justify-center rounded-md border border-transparent border-primary-yellow px-10 py-2 text-sm font-medium text-primary-yellow shadow-sm hover:bg-primary-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
                  >
                    {t("close")}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex items-center justify-center gap-10">
      <div className="wallet-pay z-20 mt-5 border border-primary-black-gray p-8 shadow-md md:w-96">
        {orderState.status === OrderStatus.PENDING ? (
          <div className="flex justify-end">
            <RefreshIcon
              className="mr-2 w-6 cursor-pointer rounded-full bg-blue-50 p-1 text-gray-500"
              onClick={() => {
                window.location.reload();
              }}
            />
          </div>
        ) : null}
        <h1 className="flex justify-center text-3xl font-extrabold tracking-tight text-primary-yellow">
          {t("order")} #{order.orderId}.
        </h1>
        {renderByOrderStatus()}
      </div>
    </div>
  );
}
