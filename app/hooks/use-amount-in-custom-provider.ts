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
import { Chain } from "wagmi";
import { ethers } from "ethers";

export const useAmountInCustomProvider = (
  amountOut: string,
  inputToken: TokenType,
  outputToken: TokenType,
  chain: Chain
): [isLoading: boolean, amountIn: string] => {
  const [amountIn, setAmountIn] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider(chain?.rpcUrls?.[0]);
    const fetchRate = async () => {
      const { SwapRouter } = getAddressList(chain?.id!);
      if (SwapRouter) {
        const router = BlockSwapRouter__factory.connect(SwapRouter, provider);

        if (inputToken?.tokenAddress && outputToken?.tokenAddress) {
          if (
            inputToken?.tokenAddress.toLowerCase() ===
            outputToken?.tokenAddress.toLowerCase()
          ) {
            setAmountIn(amountOut);
          } else {
            try {
              setIsLoading(true);
              const [amountIn] = await router.getAmountsIn(
                parseUnits(amountOut, outputToken?.tokenDecimal),
                [inputToken?.tokenAddress!, outputToken?.tokenAddress!]
              );
              setAmountIn(formatUnits(amountIn, inputToken?.tokenDecimal));
            } catch (error) {
              setAmountIn("0");
              throw "pool not found";
            } finally {
              setIsLoading(false);
            }
          }
        }
      }
    };

    fetchRate();
  }, [
    chain?.id,
    amountOut,
    inputToken?.tokenAddress,
    outputToken?.tokenAddress,
  ]);

  return [isLoading, amountIn];
};

export const getAmountIn = async (
  amountOut: string,
  inputToken: TokenType,
  outputToken: TokenType,
  chain: Chain
) => {
  const provider = new ethers.providers.JsonRpcProvider(chain?.rpcUrls?.[0]);
  const { SwapRouter } = getAddressList(chain?.id!);
  if (SwapRouter) {
    const router = BlockSwapRouter__factory.connect(SwapRouter, provider);

    if (inputToken?.tokenAddress && outputToken?.tokenAddress) {
      if (
        inputToken?.tokenAddress.toLowerCase() ===
        outputToken?.tokenAddress.toLowerCase()
      ) {
        return amountOut;
      }
      try {
        const [amountIn] = await router.getAmountsIn(
          parseUnits(amountOut, outputToken?.tokenDecimal),
          [inputToken?.tokenAddress!, outputToken?.tokenAddress!]
        );
        return formatUnits(amountIn, inputToken?.tokenDecimal);
      } catch (error) {
        return 0;
      }
    }
  }
};

export const getAmountInTokens = async (
  amountOut: string,
  tokens: TokenType[],
  chain: Chain
) => {
  const provider = new ethers.providers.JsonRpcProvider(chain?.rpcUrls?.[0]);
  const { SwapRouter } = getAddressList(chain?.id!);
  if (SwapRouter) {
    const router = BlockSwapRouter__factory.connect(SwapRouter, provider);

    if (tokens[0]?.tokenAddress && tokens[tokens.length - 1]?.tokenAddress) {
      if (
        tokens.length === 2 &&
        tokens[0]?.tokenAddress.toLowerCase() ===
          tokens[1]?.tokenAddress?.toLowerCase()
      ) {
        return amountOut;
      }
      try {
        const [amountIn] = await router.getAmountsIn(
          parseUnits(amountOut, tokens[tokens.length - 1]?.tokenDecimal),
          tokens.map((token) => `${token?.tokenAddress?.toLocaleLowerCase()}`)
        );

        return formatUnits(amountIn, tokens[0]?.tokenDecimal);
      } catch (error) {
        console.error(error);

        return 0;
      }
    }
  }
};
