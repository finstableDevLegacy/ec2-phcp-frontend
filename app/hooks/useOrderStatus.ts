import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Transcrypt__factory } from "~/typechain";
import { MerchantOrder, OrderState } from "~/type/order";
import { useNetwork, useProvider } from "wagmi";
import { getAddressList } from "~/constants/address-list";
import { getOrderFilter } from "~/api/order";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import useAppStore from "~/stores/app-store";
import { formatNumber } from "~/utils/format";
import Big from "big.js";
import { toastMessage } from "~/utils/toast";
import { PaymentOutput } from "~/enums/payment-output";

export const useOrderStatus = (
  order?: MerchantOrder,
  onStateChange?: React.Dispatch<
    React.SetStateAction<{
      status: OrderState;
      timestamp: string;
    }>
  >,
  setOrder?: Dispatch<SetStateAction<MerchantOrder>>
) => {
  const provider = useProvider();

  const [{ data }] = useNetwork();
  const [transcryptAddr, setTranscryptAddr] = useState("");
  const defaultChain = useAppStore((state) => state.defaultChain);
  let selectedChain =
    !data.chain?.id || (data.chain?.id && data.chain?.unsupported)
      ? defaultChain
      : data.chain.id;
  const checkOrder = async () => {
    if (transcryptAddr && order && onStateChange) {
      try {
        const transcrypt = Transcrypt__factory.connect(transcryptAddr, provider);
        const orderStatus = await transcrypt.orderStatus(Number(order.orderId));
        const now = +new Date() / 1000;

        const orderBackend = await getOrderFilter([
          ["id", order.orderId.toString()],
          ["merchantAddress", order.merchant],
        ]);

        // Handle purchased event
        const handlePurchasedEvent = async (
          orderId: BigNumber,
          payer: string,
          merchant: string,
          inputToken: string,
          outputToken: string,
          amountIn: BigNumber,
          amountOut: BigNumber,
          fee: BigNumber,
          dealer: string
        ) => {
          if (
            Number(orderId) === Number(order.orderId) &&
            merchant.toLowerCase() === order.merchant
          ) {
            const orderBackend = await getOrderFilter([
              ["id", Number(orderId).toString()],
              ["merchantAddress", merchant.toLowerCase()],
            ]);

            // let amountOutBackend;
            // let amountOutContract;
            // let diff;
            // let percent;

            // amountOutBackend = new Big(Number(orderBackend.amountOut))
            // const amountOutASNumber = Number(formatEther(amountOut));
            // amountOutContract = new Big(amountOutASNumber)
            // diff = (amountOutBackend.minus(amountOutContract)).abs();
            // switch (order.paymentOutput) {
            //   case PaymentOutput.FIAT:
            //     if (Number(amountOutBackend) !== 0) {
            //       percent = Big(diff).div(amountOutBackend).mul(100);
            //     } else {
            //       //FIX ME: recheck amountOutBackend later
            //       percent = 0
            //     }
            //     break;
            //   case PaymentOutput.TOKEN:
            //     percent = diff.div(amountOutBackend).mul(100);
            //     break;
            // }

            // if (Number(percent) > 10) {
            //   amountOutBackend = new Big(Number(orderBackend.amountOut)).mul(Big(9)).div(Big(10))
            //   diff = (amountOutBackend.minus(amountOutContract)).abs();
            //   switch (order.paymentOutput) {
            //     case PaymentOutput.FIAT:
            //       if (Number(amountOutBackend) !== 0) {
            //         percent = Big(diff).div(amountOutBackend).mul(100);
            //       } else {
            //         //FIX ME: recheck amountOutBackend later
            //         percent = 0
            //       }
            //       break;
            //     case PaymentOutput.TOKEN:
            //       percent = diff.div(amountOutBackend).mul(100);
            //       break;
            //   }
            // }

            // if (Number(percent) > 1) {
            //   onStateChange({
            //     status: "failed",
            //     timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
            //   });
            // } else {
            //   onStateChange({
            //     status: "success",
            //     timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
            //   });
            // }

            // const calculatePayAmount = () => {
            //   if (inputToken === outputToken) {
            //     return formatNumber(formatEther(amountOut.add(fee)));
            //   } else {
            //     return formatNumber(formatEther(amountIn));
            //   }
            // };

            // if (setOrder) {
            //   setOrder({
            //     ...order,
            //     payAmount: calculatePayAmount(),
            //   });
            // }

            // transcrypt.removeListener("Purchased", handlePurchasedEvent);
          }
        };

        // FIXME: To consider use "and", "or" for check success order
        if (Number(orderStatus) === 1 && orderBackend.status === "success") {
          onStateChange({
            status: "success",
            timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
          });
        } else if (Number(orderStatus) === 1 && orderBackend.status === 'failed') {
          onStateChange({
            status: "failed",
            timestamp: new Date(orderBackend.updatedAt).toLocaleString()
          });
        } else if (
          now > new Date(orderBackend.deadline).getTime() / 1000 ||
          orderBackend.status === "expired"
        ) {
          onStateChange({
            status: "expired",
            timestamp: new Date(orderBackend.updatedAt).toLocaleString(),
          });
        } else if (Number(orderStatus) == 0 && orderBackend.status === "pending") {
          onStateChange({ status: "pending", timestamp: "" });
        }

        transcrypt.on("Purchased", handlePurchasedEvent);
        return () => {
          transcrypt.removeListener("Purchased", handlePurchasedEvent);
        };
      } catch (error) {
        if (error instanceof Error) {
          toastMessage("Order status", error);
        }
        throw error;
      }

    }
  };

  useEffect(() => {
    if (selectedChain) {
      const { Transcrypt } = getAddressList(selectedChain);
      setTranscryptAddr(Transcrypt);
    }
  }, [selectedChain]);

  useEffect(() => {
    checkOrder();
  }, [transcryptAddr]);
};
