// import AssetBalance from "~/components/asset-balance";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNetwork } from "wagmi";

import { getTokenList } from "../../../constants/tokens";
import useWalletStore from "~/stores/wallet-store";
import AssetBalanceCard from "~/components/merchant/wallet/asset-balance-card";
import WithdrawHistory from "~/components/merchant/wallet/withdraw-history";
import WithdrawWarningModal from "~/components/merchant/wallet/withdraw-warning-modal";

type WalletViewType = {
  tabSelected: string,
  rateUSDToTHB: number,
};

export default function WalletView({ tabSelected, rateUSDToTHB }: WalletViewType) {
  const [warningModal, setWarningModal] = useState(false);
  const { t } = useTranslation("wallet");
  const [{ data }] = useNetwork();

  const tokenList = getTokenList(data.chain?.id!);
  const balances = useWalletStore((state) => state.balances);

  if (tabSelected === 'wallet') {
    return (
      <>
        <WithdrawWarningModal isOpen={warningModal} closeModal={() => setWarningModal(false)} />
        <div className="mt-7 w-full space-y-3 max-w-[600px]">
          {tokenList
            .filter((token) => token?.tokenSymbol !== "BNB" && token?.tokenSymbol != "WIS")
            .map((item, idx) => {
              return (
                <AssetBalanceCard
                  tokenUri={item.tokenLogoUri!}
                  amount={+balances[item.tokenSymbol as string]}
                  name={item.tokenName as string}
                  symbol={item.tokenSymbol as string}
                  key={idx}
                  rateUSDTToTHB = {rateUSDToTHB}
                  openModal={() => setWarningModal(true)}
                />
              );
            })}
        </div>
      </>
    );
  } else if (tabSelected === 'history') {
    return (
      <div className="w-full mt-4">
        <WithdrawHistory />
      </div>
    );
  }
  return <div />;
}
