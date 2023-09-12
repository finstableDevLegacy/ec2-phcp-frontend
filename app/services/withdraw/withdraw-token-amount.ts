import Swal from "sweetalert2";
import { Chain } from "wagmi";
import { callApiGetFiatPurchaseRate } from "~/helpers/pay/pay-fiat.helper";
import { getExactAmountInWithPoolRate } from "~/hooks/get-amount-in-with-pool-rate";
import { GetFiatPurchaseRateResponse } from "~/type/cashier/fiat-purchase-type";
import { MerchantOrder } from "~/type/order";
import { TokenType } from "~/type/token";

type tokenAmountHelperType = {
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
  receiveToken: TokenType,
}

type tokenAmountHelperRes = {
  amountIn: { amount: string; amountPlus: string; isLoading: boolean },
  amountOut: { amount: string; isLoading: boolean },
  fiatRateBeforePayRes: GetFiatPurchaseRateResponse
};

export const tokenAmountHelper = async ({
  order,
  data,
  payToken,
  receiveToken,
}: tokenAmountHelperType): Promise<tokenAmountHelperRes> => {
  let amountIn = {
    amount: "0",
    amountPlus: "0",
    isLoading: false,
  };
  let amountOut = {
    amount: "0",
    isLoading: false,
  };
  let fiatRateBeforePayRes = {
    price: 0,
    id: "",
    dealerAddress: "",
    range: [0, 0],
    getBestRate: {},
  };
  if (order && data && payToken && receiveToken) {
    try {
      amountIn = {
        ...amountIn,
        isLoading: true,
      };
      amountOut = {
        ...amountIn,
        isLoading: true,
      };
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
      amountIn = {
        amount: amountIn_,
        amountPlus: amountInPlus_,
        isLoading: false,
      };
      amountOut = {
        amount: amountOut_,
        isLoading: false,
      };
      fiatRateBeforePayRes = fiatRateBeforePay;
    } catch (err) {
      amountIn = {
        amount: "0",
        amountPlus: "0",
        isLoading: false,
      };
      amountOut = {
        amount: "0",
        isLoading: false,
      };
      fiatRateBeforePayRes = {
        price: 0,
        id: "",
        dealerAddress: "",
        range: [0, 0],
        getBestRate: {},
      };
    }
  } else {
    amountIn = {
      amount: "0",
      amountPlus: "0",
      isLoading: false,
    };
    amountOut = {
      amount: "0",
      isLoading: false,
    };
    fiatRateBeforePayRes = {
      price: 0,
      id: "",
      dealerAddress: "",
      range: [0, 0],
      getBestRate: {},
    };
  }
  
  return { amountIn, amountOut, fiatRateBeforePayRes };
}