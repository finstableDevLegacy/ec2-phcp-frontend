import { useNavigate } from "@remix-run/react";
import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { useNetwork } from "wagmi";

import useAppStore from "~/stores/app-store";
import { encryptString } from "~/utils/crypto";
import { formatNumber } from "~/utils/format";

type AssetBalanceCardType = {
    tokenUri: string;
    amount: number;
    symbol: string;
    name: string;
    fiatSymbol?: string;
    rateUSDTToTHB: number;
    openModal: () => void;
};

const AssetBalanceCard = ({
  tokenUri,
  amount,
  symbol,
  name,
  fiatSymbol = "$",
  rateUSDTToTHB,
  openModal,
}: AssetBalanceCardType) => {
  const navigator = useNavigate();
  const [balanceTHB, setBalanceTHB] = useState("0");
  const [balanceUSDT, setBalanceUSDT] = useState("0");
  const rateFiatToken = useAppStore((state) => state.rateFiatToken);

  useEffect(() => {
    const rateUSDT = rateFiatToken[symbol];
    setBalanceUSDT((rateUSDT * amount).toFixed(2));
    setBalanceTHB((rateUSDT * amount * rateUSDTToTHB).toFixed(2));
  }, [rateFiatToken, amount]);

  const onClickWithdraw = () => {
    if (+balanceTHB >= 1000) {
      const url = `symbol=${symbol}`;
      const encryptParams = encryptString(url);
      navigator(`/merchant/manager/withdraw?${encryptParams}`);
    } else {
      openModal();
    }
  }

  return (
    <div className="w-full rounded-2xl border border-t bg-primary-black-gray p-6 py-5 shadow-md">
      <div className="flex w-full flex-col md:flex-row items-start justify-between space-y-3 md:px-2">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full">
            <img
              className="h-auto w-full object-cover"
              src={tokenUri}
              alt={name}
            />
          </div>
          <div className="ml-2 flex flex-col">
            <div className="text-sm font-bold text-white">{name}</div>
            <div className="text-sm font-normal capitalize text-gray-500">
              <span className="">{formatNumber(amount)}</span>{" "}
              <span className="">{symbol}</span>
            </div>
            <div className={`text-broker truncate text-sm ${(amount < 1000) ? "text-white" : "text-white"}`}>
              {/* {fiatSymbol} */}
              {/* {formatNumber(balanceUSDT)} */}
              {` ≈ ${formatNumber(balanceTHB)} THB`}
            </div>
          </div>
        </div>
        <div className="self-center w-full md:w-fit">
          {
            (symbol === "BUSD") && (
              <button
                className="h-8 w-full md:w-32 rounded bg-primary-yellow text-sm font-normal text-slate-900 shadow-pay-wallet"
                onClick={onClickWithdraw}
              >
                Withdraw To THB
              </button>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default AssetBalanceCard;
