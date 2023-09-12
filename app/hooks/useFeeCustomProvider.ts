import { useState, useEffect } from "react";
import { Chain, useNetwork, useProvider } from "wagmi";
import { formatUnits } from "ethers/lib/utils";
import { getAddressList } from "~/constants/address-list";
import { Transcrypt__factory } from "~/typechain";
import { ethers } from "ethers";

export const useFeeCustomProvider = (
  chain: Chain
): [isLoading: boolean, fee: number] => {
  const [fee, setFee] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFee = async () => {
      const provider = new ethers.providers.JsonRpcProvider(
        chain?.rpcUrls?.[0]
      );
      const addressList = getAddressList(chain?.id);
      const transcryptAddress = addressList["Transcrypt"];

      if (transcryptAddress) {
        const transcrypt = Transcrypt__factory.connect(
          transcryptAddress,
          provider
        );
        try {
          setIsLoading(true);
          const [transcryptFeeData, transcryptFeeDecimals] = await Promise.all([
            transcrypt.fee(),
            transcrypt.feeDecimals(),
          ]);

          const transcryptFee =
            +formatUnits(transcryptFeeData, transcryptFeeDecimals) * 100;

          setFee(transcryptFee);
        } catch (error) {
          setFee(0);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFee();
  }, [chain]);

  return [isLoading, fee];
};
