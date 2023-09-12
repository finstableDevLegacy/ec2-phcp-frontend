import { Chain } from "wagmi";
import { getFiatPurchaseRate } from "~/api/merchant/fiat-purchase-rate";
import { MerchantOrder } from "~/type/order";

export const callApiGetFiatPurchaseRate = (
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
  }
) => {
  return getFiatPurchaseRate(
    Number(order.price),
    `${data?.chain?.id}`,
    order?.currency,
    order?.receiveToken as string
  );
};
