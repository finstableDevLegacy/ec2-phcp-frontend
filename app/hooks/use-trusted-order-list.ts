import { useState, useEffect, Dispatch, SetStateAction } from "react";

import { trustedOrderList } from '~/api/merchant/trusted-order-list';
import { getFiatRate } from '~/api/merchant/fiat-purchase-rate';

import { GetBestRateContentType } from "~/type/cashier/fiat-purchase-type";

type TrustedOrderListType = {
  page?: string,
  limit?: string,
  amount?: string,
  fiatName?: string,
  tokenSymbol?: string,
  paymentMethodId?: string,
  chainId: string,
};

export const useTrustedOrderList = (req: TrustedOrderListType) => {
  const [isFetchTrustedOrder, setIsFetchTrustedOrder] = useState(false);
  const [trustedOrderLists, setTrustedOrderLists] = useState<GetBestRateContentType [] | []>([]);
  const [trustedOrderReq, setTrustedOrderReq] = useState(req);
  const [fiatRatePair, setFiatRatePair] = useState('0');
  useEffect(() => {
    const fetch = async () => {
      const fiatRatePairRes = await getFiatRate('BUSD','THB', req.chainId);
      const data = await trustedOrderList(trustedOrderReq || req);
      setFiatRatePair(fiatRatePairRes)
      setTrustedOrderLists(data);
      setIsFetchTrustedOrder(false);
    }
    try {
      setIsFetchTrustedOrder(true);
      fetch();
    } catch (err) {
      console.log(err);
      setIsFetchTrustedOrder(false);
      throw err;
    }
  }, [trustedOrderReq])
  return [trustedOrderLists, isFetchTrustedOrder, setIsFetchTrustedOrder, setTrustedOrderReq, fiatRatePair] as [
    GetBestRateContentType [],
    boolean,
    Dispatch<SetStateAction<boolean>>,
    Dispatch<SetStateAction<TrustedOrderListType>>,
    string
  ];
}