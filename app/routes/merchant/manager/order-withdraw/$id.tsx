// Processing is having trouble connecting to the dealer | Please contact assistance
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { ChevronLeftIcon } from "@heroicons/react/outline";

import { MerchantOrder } from "~/type/order";
import { WithdrawOrderStatus } from "~/enums/withdraw-order-status";

import { saveWithdrawOrder } from "~/api/order";
import { getOrderFiatById } from "~/api/merchant/manager";
import { getOrderFilter } from "~/api/order";

import { formatCapitalize, formatNumber } from "~/utils/format";
import { shortenTxLink, TxHash } from "~/utils/shorten";
import { parseEncryptURL } from "~/utils/crypto";
import { mapMerchantOrder } from "~/utils/order";
import { delay } from '~/utils/delay';

import Loading from "~/components/loading";
import WithdrwawHistoryModal from '~/components/merchant/wallet/withdraw-history-modal';

type LoaderData = {
  _order: MerchantOrder;
  misleading: string;
  slipImageUrl: string;
  orderId: string;
};

export let handle = {
  i18n: ["order"],
};

export const loader: LoaderFunction = async ({ request }) => {
  const { parseURL } = parseEncryptURL(request.url);
  const hasOrderId = parseURL.searchParams.has("orderId");

  if (!hasOrderId) return redirect("/merchant/manager/wallet");

  const orderId = parseURL.searchParams.get("orderId")!;
  const result = await getOrderFilter([["id", orderId]]);

  const order = mapMerchantOrder(result);
  let slipImageUrl: string = "";
  try {
    let getSlipImageUrl = await getOrderFiatById(orderId);

    if (!getSlipImageUrl) {
      slipImageUrl = "";
    }
    slipImageUrl = getSlipImageUrl || "";
  } catch (error) {
    return (slipImageUrl = "");
  }
  return {
    _order: order,
    slipImageUrl,
    orderId,
  };
};

export default function Order() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);
  const { _order, misleading, slipImageUrl, orderId } = useLoaderData<LoaderData>();
  const [isDisableRetry, setIsDisableRetry] = useState(_order?.withdrawOrder?.status !== WithdrawOrderStatus.RETRY);
  const [order, setOrder] = useState(_order);
  const { t } = useTranslation("order");
  const navigate = useNavigate();
  let withdrawPrice;
  const feeCal = (Number(order.receiveFiatValue) * Number(order.fee)) / 100;
  const receiveAmount = `${formatNumber(Number(order.receiveTokenValue))} ${
    order.receiveToken
  }`;
  if (order.discount_percentage) {
    withdrawPrice = `${formatNumber(
      (Number(order.price) * (100 - Number(order.discount_percentage))) / 100
    )}`;
  } else {
    withdrawPrice = `${formatNumber(Number(order.receiveFiatValue) + feeCal)}`;
  }
  const rateExchange = Number(withdrawPrice) / Number(order.payAmount);
  const netReceiveToken = Number(order.receiveFiatValue) / rateExchange;

  const openModal = () => {
    setIsOpenModal(true);
  }
  const closeModal = () => {
    setIsOpenModal(false);
  }

  const onRetryWithdrawOrder = async () => {
    setLoadingRetry(true);
    try {
      await delay(500);
      const recordWithdrawOrder = await saveWithdrawOrder({
        txHash: TxHash(order?.transactionHash),
        orderId: JSON.parse(order?.withdrawOrder?.detail)?.id,
        withdrawId: order?.withdrawOrder?.id,
        chainId: order?.networkId,
        price: JSON.parse(order?.withdrawOrder?.detail)?.price,
      });
      if (!recordWithdrawOrder?.data?.withdrawId) {
        openModal();
      }
      setRetrySuccess(!retrySuccess);
    } catch (error) {
      openModal();
      setLoadingRetry(false);
      throw error;
    }
    setLoadingRetry(false);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      const result = await getOrderFilter([["id", orderId]]);

      const order = mapMerchantOrder(result);
      setOrder(order);
      let slipImageUrl: string = "";
      try {
        let getSlipImageUrl = await getOrderFiatById(orderId);
    
        if (!getSlipImageUrl) {
          slipImageUrl = "";
        }
        slipImageUrl = getSlipImageUrl || "";
      } catch (error) {
        return (slipImageUrl = "");
      }
    }
    fetchOrder();
  }, [_order, retrySuccess]);

  useEffect(() => {
    setIsDisableRetry(order.withdrawOrder.status !== WithdrawOrderStatus.RETRY);
  }, [order]);

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <WithdrwawHistoryModal isOpen={isOpenModal} closeModal={closeModal} />
      <div
        className="mt-10 flex w-full cursor-pointer items-center justify-start  text-primary-yellow"
        onClick={() => {
          navigate(-1);
        }}
      >
        <ChevronLeftIcon className="h-5 w-6" />
        Back
      </div>
      <div className="wallet-pay max-w-md border-primary-black-gray bg-white p-8 shadow-md md:w-96">
        <div>
          <h1 className="mb-10 flex justify-center text-3xl font-extrabold tracking-tight text-gray-900">
            <span className="font-bold text-primary-yellow">
              {t("Withdraw Order")} #{order.withdrawOrder.id}
            </span>
          </h1>
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">{t("status")}</h1>
            <p
              className={`${
                order.withdrawOrder.status === WithdrawOrderStatus.SUCCESS
                  ? "text-green-500"
                  : order.withdrawOrder.status ===
                      WithdrawOrderStatus.EXPIRED ||
                    order.withdrawOrder.status === WithdrawOrderStatus.FAILED
                  ? "text-red-500"
                  : order.withdrawOrder.status === WithdrawOrderStatus.RETRY
                  ? "text-orange-400"
                  : "text-yellow-500"
              }`}
            >
              {formatCapitalize(order.withdrawOrder.status)}
            </p>
          </div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">
              {t("transaction_hash")}
            </h1>
            <a
              href={order.transactionHash}
              target="_blank"
              className="text-white"
            >
              {shortenTxLink(order.transactionHash!)}
            </a>
          </div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">{t("Amount")}</h1>
            <p className="text-white">
              {formatNumber(order.receiveFiatValue)} {order.currency}
            </p>
          </div>
          {/* <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">{t("rate")}</h1>
            <p className="text-white">
              1 {order.payToken} : {formatNumber(rateExchange)}
              {order.currency}
            </p>
          </div> */}
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">{t("fee")}</h1>
            <p className="text-white">
              {/* {feeCal || 0} {order.currency} */}
              {formatNumber(feeCal) || 0} {order.currency}
            </p>
          </div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-[12px] font-bold text-white">
              {order.discount_percentage
                ? t("total_with_discount")
                : t("total")}
            </h1>
            <p className="text-white">
              {formatNumber(order.withdrawOrder.amount)} {order.currency}
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            {slipImageUrl ? (
              <div>
                <img width={250} src={slipImageUrl} alt="slipImage" />
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="mt-5 flex justify-center text-white">
            <p>{new Date(order.updatedAt!).toLocaleString()}</p>
          </div>
          <div className="mt-5 flex justify-center">
            {misleading ? (
              <div>
                <img src={misleading} alt="slipImage" />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="mt-5 space-y-3 md:space-y-0 flex flex-col justify-between md:flex-row">
            <button className="h-10 rounded-md border border-primary-yellow bg-white px-5 font-medium text-primary-yellow transition-colors hover:bg-primary-yellow hover:text-white">
              <a href={order.transactionHash} target="_blank">
                {t("view_on_block_explorer")}
              </a>
            </button>
            <button className="h-10 rounded-md bg-primary-yellow px-5 font-medium text-white transition-colors hover:border hover:border-primary-dark-blue hover:bg-white hover:text-primary-dark-blue">
              <Link to="/merchant/manager/wallet">{t("back")}</Link>
            </button>
          </div>
          {isDisableRetry ? <div />: (
            <div className="mt-3">
              {loadingRetry ? (
                <button className="h-10 w-full rounded-md bg-primary-yellow px-5 font-medium text-white flex justify-center items-center">
                  <Loading />
                  processing...
                </button>
              ) : (
                <button
                  onClick={onRetryWithdrawOrder}
                  className="h-10 w-full rounded-md bg-primary-yellow px-5 font-medium text-white transition-colors hover:border hover:border-primary-dark-blue hover:bg-white hover:text-primary-dark-blue"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
