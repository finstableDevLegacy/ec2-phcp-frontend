import { Dispatch, SetStateAction } from "react";
import { GetBestRateContentType } from "~/type/cashier/fiat-purchase-type";
import { formatNumber } from "~/utils/format";

type WihtdrawCardType = {
  item: GetBestRateContentType;
  exchangeRate: string;
  openModal: (_amount: number, _tokenSymbol: string, item: GetBestRateContentType, exchangeRate: string) => void
};

const WithdrawCard = ({ item, exchangeRate, openModal }: WihtdrawCardType) => {
  return (
    <div className="w-full rounded-2xl border border-t bg-primary-black-gray p-3 md:p-6 md:py-5 shadow-md">
      <div className="flex w-full flex-col sm:flex-row items-start justify-between space-y-3 md:px-2 md:items-center">
        <div className="flex items-center">
          <div className="ml-2 flex flex-col">
            <div className="text-md font-bold text-white mb-2">
              <span>Range: </span>
              <span className="font-normal">{`${formatNumber(item.floor)} - ${formatNumber(item.ceiling)} THB`}</span>
            </div>
            <div className="text-sm font-normal capitalize">
              <span className="text-white">Amount available: </span>
              <span className="text-white">{`${formatNumber(item.amountAvailable)}`} </span>
              <span className="text-white">THB</span>
            </div>
            <div>
              {/* <div className="text-broker ml-12 truncate text-sm font-bold text-broker-grey-3 md:ml-0"> */}
              <span className="text-broker truncate text-sm text-white">Exchange rate: </span>
              <span className="text-lg font-bold text-primary-yellow">{exchangeRate}</span>
              <span className="text-broker font-bold truncate text-sm text-primary-yellow"> THB</span>
            </div>
          </div>
        </div>
          <button
            className="h-8 w-full md:w-20 rounded bg-green-400 text-sm font-normal text-slate-900 shadow-pay-wallet"
            onClick={() => {openModal(100, 'BUSD', item, exchangeRate)}}
          >
            Select
          </button>
      </div>
    </div>
  );
};

export default WithdrawCard;
