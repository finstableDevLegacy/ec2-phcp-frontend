import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Chain } from "wagmi";
import { callApiGetFiatPurchaseRate } from "~/helpers/pay/pay-fiat.helper";
import { getExactAmountInWithPoolRate } from "~/hooks/get-amount-in-with-pool-rate";
import { GetFiatPurchaseRateResponse } from "~/type/cashier/fiat-purchase-type";
import { MerchantOrder } from "~/type/order";
import { TokenType } from "~/type/token";

export function useTokenAmount(
  order: MerchantOrder,
  data: {
    readonly chain:
      | {
          id: number;
          unsupported: boolean | undefined;
          name?: string | undefined;
          nativeCurrency?:
            | {
                name: string;
                symbol: string;
                decimals: 18;
              }
            | undefined;
          rpcUrls?: string[] | undefined;
          blockExplorers?:
            | {
                name: string;
                url: string;
              }[]
            | undefined;
          testnet?: boolean | undefined;
        }
      | undefined;
    readonly chains: Chain[];
  },
  payToken: TokenType,
  receiveToken: TokenType
) {
  const [amountIn, setAmountIn] = useState({
    amount: "0",
    amountPlus: "0",
    isLoading: false,
  });
  const [amountOut, setAmountOut] = useState({
    amount: "0",
    isLoading: false,
  });
  const fetchTokenAmount = async () => {
    try {
      setAmountIn({
        ...amountIn,
        isLoading: true,
      });
      setAmountOut({
        ...amountOut,
        isLoading: true,
      });
      const fiatRateBeforePay = await callApiGetFiatPurchaseRate(order, data);
      if (!fiatRateBeforePay?.price) {
        const errorMessage = "rate not found";
        Swal.fire({
          title: errorMessage,
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
        throw new Error(errorMessage);
      }
      const amountOut_ = String(Number(order.price) / fiatRateBeforePay!.price);
      const [amountIn_, amountInPlus_] = await getExactAmountInWithPoolRate({
        payToken,
        receiveToken,
        selectedChain: data.chain as Chain,
        amountOut: amountOut_,
      });
      setAmountIn({
        amount: amountIn_,
        amountPlus: amountInPlus_,
        isLoading: false,
      });
      setAmountOut({
        amount: amountOut_,
        isLoading: false,
      });
      return fiatRateBeforePay;
    } catch (err) {
      setAmountIn({
        amount: "0",
        amountPlus: "0",
        isLoading: false,
      });
      setAmountOut({
        amount: "0",
        isLoading: false,
      });
      return {
        price: 0,
        id: "",
        dealerAddress: "",
      };
    }
  };

  useEffect(() => {
    if (data?.chain?.id) {
      fetchTokenAmount();
    }
  }, [
    order.price,
    data?.chain?.id,
    payToken?.tokenAddress,
    receiveToken?.tokenAddress,
  ]);

  useEffect(() => {});

  return [amountIn, amountOut, fetchTokenAmount] as [
    { amount: string; amountPlus: string; isLoading: boolean },
    { amount: string; isLoading: boolean },
    () => Promise<GetFiatPurchaseRateResponse>
  ];
}
