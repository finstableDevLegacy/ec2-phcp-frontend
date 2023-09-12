import { useEffect, useState } from "react";
import { Transcrypt__factory } from "~/typechain";
import { MerchantOrder, OrderState } from "~/type/order";
import { Chain } from "wagmi";
import { getAddressList } from "~/constants/address-list";
import { getOrderFilter } from "~/api/order";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { useCustomProvider } from "./useCustomProvider";
import { BaseProvider } from "@ethersproject/providers";
import Big from 'big.js';
import * as Sentry from "@sentry/remix";
import { MemberDetail } from "~/type/member";
import { LoaderFunction } from "@remix-run/node";
import { getCashierUser } from "~/utils/cashier-session.server";
import { useLoaderData } from "@remix-run/react";
import { PaymentOutput } from "~/enums/payment-output";

type LoaderData = {
  cashierData: MemberDetail | undefined;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cashierData = await getCashierUser(request);
  return {
    cashierData: cashierData?.user,
  };
};

export const useMerchantOrderStatus = (
  order: MerchantOrder,
  onStateChange: React.Dispatch<
    React.SetStateAction<{
      status: OrderState;
      timestamp: string;
    }>
  >,
  chains: Chain[],
  isCountDownFinish: boolean
) => {
  const [amountOutResult, setAmountOutResult] = useState(0);
  const [bsc] = chains;
  const { cashierData } = useLoaderData<LoaderData>();

  const { provider: bscProvider } = useCustomProvider(bsc);

  const checkOrder = async (chainId: number, provider: BaseProvider) => {
    const { Transcrypt } = getAddressList(chainId);
    const orderBackend = await getOrderFilter([
      ["id", order.orderId.toString()],
      ["merchantAddress", order.merchant],
    ]);
    try {
      if (Transcrypt) {
        const transcrypt = Transcrypt__factory.connect(Transcrypt, provider);
        const orderStatus = await transcrypt.orderStatus(Number(order.orderId));
        const now = +new Date() / 1000;

        // Handle purchased event
        const handlePurchasedEvent = async (
          orderId: BigNumber,
          payer: string,
          merchant: string,
          inputToken: string,
          outputToken: string,
          amountIn: BigNumber,
          amountOut: BigNumber
        ) => {
          if (
            Number(orderId) === Number(order.orderId) &&
            merchant.toLowerCase() === order.merchant
          ) {

            if (!isCountDownFinish) {
              const orderBackend = await getOrderFilter([
                ["id", Number(orderId).toString()],
                ["merchantAddress", merchant.toLowerCase()],
              ]);

              const amountOutAsNumber = await Number(formatEther(amountOut));
              localStorage.setItem(
                "amountOutAsNumber",
                amountOutAsNumber.toString()
              );
              await setAmountOutResult(amountOutAsNumber);
              let amountOutBackend;
              let amountOutContract;
              let diff;
              let percent;

              amountOutBackend = new Big(Number(orderBackend.amountOut))
              amountOutContract = new Big(amountOutAsNumber)
              diff = (amountOutBackend.minus(amountOutContract)).abs();
              switch (order.paymentOutput) {
                case PaymentOutput.FIAT:
                  if (Number(amountOutBackend) !== 0) {
                    percent = Big(diff).div(amountOutBackend).mul(100);
                  } else {
                    //FIX ME: recheck amountOutBackend later
                    percent = 0
                  }
                  break;
                case PaymentOutput.TOKEN:
                  percent = diff.div(amountOutBackend).mul(100);
                  break;
              }

              if (Number(percent) > 10) {
                amountOutBackend = new Big(Number(orderBackend.amountOut)).mul(Big(9)).div(Big(10))
                diff = (amountOutBackend.minus(amountOutContract)).abs();
                switch (order.paymentOutput) {
                  case PaymentOutput.FIAT:
                    if (Number(amountOutBackend) !== 0) {
                      percent = Big(diff).div(amountOutBackend).mul(100);
                    } else {
                      //FIX ME: recheck amountOutBackend later
                      percent = 0
                    }
                    break;
                  case PaymentOutput.TOKEN:
                    percent = diff.div(amountOutBackend).mul(100);
                    break;
                }
              }
              if (Number(percent) > 1) {
                onStateChange({
                  status: "failed",
                  timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
                });
              } else {
                onStateChange({
                  status: "success",
                  timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
                });
              }
              transcrypt.removeListener("Purchased", handlePurchasedEvent);
            }
          }
        };

        if (Number(orderStatus) == 1 && orderBackend.status === "success") {
          onStateChange({
            status: "success",
            timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
          });
        } else if (Number(orderStatus) === 1 && orderBackend.status === 'failed') {
          onStateChange({
            status: "failed",
            timestamp: new Date(orderBackend.updatedAt).toLocaleString()
          });
        } else if (Number(orderStatus) == 0 && orderBackend.status === "pending") {
          onStateChange({ status: "pending", timestamp: "" });
        } else if (
          now > new Date(orderBackend.deadline).getTime() / 1000 ||
          orderBackend.status === "expired"
        ) {
          onStateChange({
            status: "expired",
            timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
          });
        }

        transcrypt.on("Purchased", handlePurchasedEvent);

        return () => {
          transcrypt.removeListener("Purchased", handlePurchasedEvent);
        };
      }
    } catch (error) {
      if (order) {
        const sentryData = {
          error: error,
          orderID: order.orderId,
          cashierID: cashierData?.id,
          timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
        }
        return Sentry.captureException(sentryData);;
      }
      Sentry.captureException(error);
    }
  };

  useEffect(() => {
    if (bsc?.id?.toFixed() && bscProvider) {
      checkOrder(bsc.id, bscProvider);
    }

  }, [bsc, bscProvider]);
  return amountOutResult;
};
