import { constants } from "ethers";
import { useState } from "react";
import { useNetwork, useSigner } from "wagmi";
import { ERC20__factory } from "~/typechain";
import Loading from "./loading";
import type { TokenType } from "~/type/token";
import { getAddressList } from "~/constants/address-list";

export default function ApproveToken({
  token,
  onApprove,
}: {
  token: TokenType;
  onApprove?: (token: TokenType) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisplay, setIsDisplay] = useState(true);
  const [, getSigner] = useSigner({
    skip: true,
  });
  const [{ data }] = useNetwork();

  const handleApprove = async () => {
    try {
      if (data.chain?.id! && !isLoading) {
        setIsLoading(true);

        const { Transcrypt } = getAddressList(data.chain?.id!);
        const signer = await getSigner();

        const tokenContract = ERC20__factory.connect(
          token.tokenAddress as string,
          signer!
        );
        const tx = await tokenContract.approve(
          Transcrypt,
          constants.MaxUint256
        );
        await tx.wait();

        if (onApprove) onApprove(token);

        setIsDisplay(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isDisplay ? (
        <div className="mt-2">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-yellow px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-yellow "
            onClick={handleApprove}
          >
            {isLoading ? <Loading /> : null}
            Approve {token.tokenSymbol}
          </button>
        </div>
      ) : null}
    </>
  );
}
