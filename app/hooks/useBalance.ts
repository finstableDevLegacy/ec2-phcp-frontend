import { useState, useEffect } from "react";
import { useAccount, useNetwork, useProvider } from "wagmi";
import { formatUnits } from "ethers/lib/utils";
import { getTokenMap } from "~/constants/tokens";
import { ERC20__factory } from "~/typechain";

export const useBalance = (
  tokenName: string
): [isLoading: boolean, balance: string, fetchBalance: () => void] => {
  const accounts = useAccount();
  const provider = useProvider();
  const account = accounts[0].data?.address;

  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [{ data }] = useNetwork();

  const fetchBalance = async () => {
    const tokenMap = getTokenMap(data.chain?.id!);
    const token = tokenMap[tokenName];

    if (token?.tokenAddress && account) {
      const erc20 = ERC20__factory.connect(token.tokenAddress, provider);
      try {
        setIsLoading(true);
        const [balance, decimals] = await Promise.all([
          erc20.balanceOf(account),
          erc20.decimals(),
        ]);

        setBalance(formatUnits(balance, decimals));
      } catch (error) {
        setBalance("0");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [tokenName, data.chain?.id!, account]);

  return [isLoading, balance, fetchBalance];
};
