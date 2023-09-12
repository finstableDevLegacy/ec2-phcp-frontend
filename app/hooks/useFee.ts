import { useState, useEffect } from "react";
import { useNetwork, useProvider } from "wagmi";
import { formatUnits } from "ethers/lib/utils";
import { getAddressList } from "~/constants/address-list";
import { Transcrypt__factory } from "~/typechain";

export const useFee = (chain: number): [isLoading: boolean, fee: number] => {
  const provider = useProvider();
  const [fee, setFee] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFee = async () => {
    const addressList = getAddressList(chain);
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

  useEffect(() => {
    fetchFee();
  }, [chain]);

  return [isLoading, fee];
};
