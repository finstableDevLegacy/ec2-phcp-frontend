import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LoaderFunction, redirect } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import i18n from "~/i18n.server";
import { getOrder, getOrderFilter } from "~/api/order";
import { useAccount } from "wagmi";
import { parseEncryptURL } from "~/utils/crypto";
import { OrderResponse } from "~/type/api-response";
import { shorten, shortenTxLink } from "~/utils/shorten";
import { formatCapitalize, formatNumber } from "~/utils/format";
import { ChevronLeftIcon } from "@heroicons/react/outline";
import { MerchantOrder } from "~/type/order";
import { mapMerchantOrder } from "~/utils/order";

type LoaderData = {
  order: MerchantOrder;
};

export let handle = {
  i18n: ["order"],
};

export const loader: LoaderFunction = async ({ request }) => {
  const { parseURL } = parseEncryptURL(request.url);
  const hasOrderId = parseURL.searchParams.has("orderId");

  if (!hasOrderId) return redirect("/merchant/order");

  const orderId = parseURL.searchParams.get("orderId")!;

  const result = await getOrderFilter([["id", orderId]]);

  const order = mapMerchantOrder(result);

  return {
    order,
  };
};

export default function Order() {
  const { order } = useLoaderData<LoaderData>();
  const { t } = useTranslation("order");
  const navigate = useNavigate();
  const feeCal = (Number(order.receiveFiatValue) * Number(order.fee)) / 100;
  const receiveAmount = `${formatNumber(Number(order.receiveTokenValue))} ${
    order.receiveToken
  }`;

  let productPrice;
  if (order.discount_percentage) {
    productPrice = `${formatNumber(
      (Number(order.price) * (100 - Number(order.discount_percentage))) / 100
    )}`;
  } else {
    productPrice = `${formatNumber(Number(order.receiveFiatValue) + feeCal)}`;
  }
  const rateExchange = Number(productPrice) / Number(order.payAmount);
  const netReceiveToken = Number(order.receiveFiatValue) / rateExchange;

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div
        className="mt-10 flex w-full cursor-pointer items-center justify-start text-primary-yellow"
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
              {t("order")} #{order.orderId}
            </span>
          </h1>
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">{t("status")}</h1>
            <p
              className={`${
                order.status === "success"
                  ? "text-green-500"
                  : order.status === "expired"
                  ? "text-red-500"
                  : ""
              }`}
            >
              {formatCapitalize(order.status)}
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
            <h1 className="text-sm font-bold text-white">{t("from")}</h1>
            <p className="text-white">{shorten(order.payerAddress!)}</p>
          </div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">{t("to")}</h1>
            <p className="text-white">{order.manager?.name}</p>
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
            <h1 className="text-sm font-bold text-white">{t("rate")}</h1>
            <p className="text-white">
              1 {order.payToken} : {formatNumber(rateExchange)}
              {order.currency}
            </p>
          </div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">{t("fee")}</h1>
            <p className="text-white">
              {feeCal} {order.currency}
            </p>
          </div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-[12px] font-bold text-white">
              {order.discount_percentage
                ? t("total_with_discount")
                : t("total")}
            </h1>
            <p className="text-white">
              {formatNumber(productPrice)} {order.currency}
            </p>
          </div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">{t("paid_amount")}</h1>
            <p className="text-white">
              {formatNumber(order.payAmount)} {order.payToken}
            </p>
          </div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-sm font-bold text-white">
              {t("receive_amount")}
            </h1>
            <p className="text-white">{receiveAmount}</p>
          </div>
          <div className="mt-5 flex justify-center ">
            <p className="text-white">
              {new Date(order.updatedAt!).toLocaleString()}
            </p>
          </div>
          <div className="mt-5 flex flex-col justify-between md:flex-row">
            <button className="h-10 rounded-md border border-primary-yellow bg-white px-5 font-medium text-primary-dark-blue transition-colors hover:bg-primary-yellow hover:text-white">
              <a href={order.transactionHash} target="_blank">
                {t("view_on_block_explorer")}
              </a>
            </button>
            <button className="h-10 rounded-md bg-primary-yellow px-5 font-medium text-white transition-colors hover:border hover:border-primary-dark-blue hover:bg-white hover:text-primary-dark-blue">
              <Link to="/merchant/manager/orders/token">{t("back")}</Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
