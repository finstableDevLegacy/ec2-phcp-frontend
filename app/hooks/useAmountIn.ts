import { useState, useEffect } from "react";
import { useNetwork, useProvider } from "wagmi";
import { BlockSwapRouter__factory } from "~/typechain/factories/BlockSwapRouter__factory";
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers/lib/utils";
import { getAddressList } from "~/constants/address-list";
import { TokenType } from "~/type/token";

export const useAmountIn = (
  amountOut: string,
  inputToken: TokenType,
  outputToken: TokenType
): [isLoading: boolean, amountIn: string] => {
  const provider = useProvider();
  const [amountIn, setAmountIn] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [{ data }] = useNetwork();

  useEffect(() => {
    const fetchRate = async () => {
      const { SwapRouter } = getAddressList(data.chain?.id!);
      if (SwapRouter) {
        const router = BlockSwapRouter__factory.connect(SwapRouter, provider);

        if (inputToken.tokenAddress && outputToken.tokenAddress) {
          if (
            inputToken.tokenAddress.toLowerCase() ===
            outputToken.tokenAddress.toLowerCase()
          ) {
            setAmountIn(amountOut);
          } else {
            try {
              setIsLoading(true);
              const [amountIn] = await router.getAmountsIn(
                parseUnits(amountOut, outputToken.tokenDecimal),
                [inputToken.tokenAddress!, outputToken.tokenAddress!]
              );

              setAmountIn(formatUnits(amountIn, inputToken.tokenDecimal));
            } catch (error) {
              setAmountIn("N/A");
              throw "N/A";
            } finally {
              setIsLoading(false);
            }
          }
        }
      }
    };

    fetchRate();
  }, [
    data.chain?.id,
    amountOut,
    inputToken?.tokenAddress,
    outputToken?.tokenAddress,
  ]);

  return [isLoading, amountIn];
};
