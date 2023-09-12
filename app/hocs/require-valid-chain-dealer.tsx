import { useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import DealerLayout from "~/components/layout/dealer-layout";
import { getValiChainDealer } from "~/constants/valid-chain-dealer";

export default function requireValidChainDealer(WrappedComponent: any) {
  return (props: any) => {
    const [{ data, error, loading }, switchNetwork] = useNetwork();
    const [isValidChain, setIsValidChain] = useState(true);

    useEffect(() => {
      if (!data?.chain?.id) {
        setIsValidChain(true);
      } else if (getValiChainDealer().includes(data?.chain?.id as number)) {
        setIsValidChain(true);
      } else {
        setIsValidChain(false);
      }
    }, [data?.chain?.id]);

    if (!isValidChain) {
      return (
        <DealerLayout>
          <div className="flex h-[calc(100vh-6em)] flex-col justify-center">
            <h4 className="text-md text-center">
              Please change network to Bitkub chain
            </h4>
          </div>
        </DealerLayout>
      );
    }

    return (
      <DealerLayout>
        <WrappedComponent {...props} />
      </DealerLayout>
    );
  };
}
