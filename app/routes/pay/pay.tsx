import { useEffect, useState } from "react";
import { LoaderFunction, redirect } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import type { MerchantOrder, OrderState } from "~/type/order";
import Countdown from "~/components/countdown";
import { shorten } from "~/utils/shorten";
import TokenListbox from "~/components/ui/tokenListbox";
import Loading from "~/components/loading";
import { useAmountIn, useApproveToken, useOrderStatus } from "~/hooks";
import { Chain, useAccount, useConnect, useNetwork, useSigner } from "wagmi";
import { Transcrypt__factory } from "~/typechain";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import ApproveToken from "~/components/approve-token";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/solid";
import LoadingIcon from "~/components/loading-icon";
import { getTokenList } from "~/constants/tokens";
import { TokenType } from "~/type/token";
import { useTranslation } from "react-i18next";
import { useBalance } from "~/hooks/useBalance";
import { formatNumber } from "~/utils/format";
import { parseEncryptURL } from "~/utils/crypto";
import { getAddressList } from "~/constants/address-list";
import LoginModal from "~/components/login-modal";
import NetworkSwitcher from "~/components/layout/pay/wallet/network-switcher";
import { getOrderFilter } from "~/api/order";
import { useTokenExchangeRate } from "~/hooks/useTokenExchangeRate";
import { getChains } from "~/config/network";
import { mapMerchantOrder } from "~/utils/order";
import { getTokenBySymbolAndNetwork, getTokensByNetworkId } from "~/api/token";
import { ContractTransaction } from "ethers";
import { getAmountInTokens } from "~/hooks/use-amount-in-custom-provider";
import { usePoolRateCustomerPay } from "~/hooks/use-pool-rate-customer-pay";
import PayToken from "~/components/cashier/pay-token";
import { PaymentOutput } from "~/enums/payment-output";
import Swal from "sweetalert2";
import PayFiat from "~/components/pay/pay/pay-fiat";

type LoaderData = {
  order: MerchantOrder;
  chains: Chain[];
  errorMessage?: string;
};

export let handle = {
  i18n: ["pay"],
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData | Response> => {
  try {
    const { parseURL } = parseEncryptURL(request.url);
    const isOrderId = parseURL.searchParams.has("orderId");
    if (!isOrderId) return redirect("/merchant");
    const orderId = parseURL.searchParams.get("orderId")!;
    const { chains } = getChains(process.env.ENV);
    const result = await getOrderFilter([["id", orderId]]);
    const order = mapMerchantOrder(result);

    return {
      order,
      chains,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        order: {
          orderId: "",
          price: "",
          merchant: "",
          merchantName: "",
          receiveToken: "",
          receiveTokenValue: "",
          exchangeRate: "",
          currency: "",
          deadline: "",
          receiveFiatValue: "",
          fee: "",
          networkId: "",
          transactionHash: "",
          status: "",
          payerAddress: "",
          payAmount: "",
          payToken: "",
          manager: {
            id: "",
            walletAddress: "",
            name: "",
            address: "",
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            acceptFiat: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          updatedAt: new Date(),
          paymentOutput: PaymentOutput.TOKEN,
          discount_percentage: "",
          amountOut: Number(),
        },
        chains: [],
        errorMessage: error?.message,
      };
    }
    return redirect("/pay");
  }
};

export default function Pay() {
  const { order: orderFetched, chains } = useLoaderData<LoaderData>();
  const [order, setOrder] = useState(orderFetched);
  if (order.paymentOutput === PaymentOutput.TOKEN) {
    return (
      <PayToken
        order={order}
        setOrder={setOrder}
        orderFetched={orderFetched}
        chains={chains}
      />
    );
  }
  return <PayFiat orderFetched={order} chains={chains} />;
}
