import { useEffect, useState } from "react";
import { useNetwork, useSigner } from "wagmi";
import { ERC20__factory } from "~/typechain";
import { getAddressList } from "~/constants/address-list";

export const useApproveToken = (
  token: string
): { showApprove: boolean; fetchApproval: () => void } => {
  const [, getSigner] = useSigner();
  const [{ data }] = useNetwork();
  const [showApprove, setShowApprove] = useState(false);

  const fetch = async () => {
    if (token && data.chain?.id) {
      const { Transcrypt } = getAddressList(data.chain?.id!);
      const signer = await getSigner();
      const tokenContract = ERC20__factory.connect(token, signer!);
      const address = await signer?.getAddress();
      const allowance = await tokenContract.allowance(address!, Transcrypt);
      if (Number(allowance) == 0) {
        setShowApprove(true);
      } else {
        setShowApprove(false);
      }
    }
  };

  useEffect(() => {
    fetch();
  }, [token, data.chain?.id]);

  return { showApprove, fetchApproval: fetch };
};
