import { getMulticall as multicall } from "../utils/getMulticall";
import { ContractCallContext } from "ethereum-multicall";
import { NetworkID } from "../constants/network-id";
import { ERC20__factory } from "../typechain/factories/ERC20__factory";
import { Provider } from "@ethersproject/providers";
import { formatUnits } from "ethers/lib/utils";
import { getTokenList } from "../constants/tokens";

const getTokenBalances = async (
  address: string,
  provider: Provider,
  network: NetworkID
) => {
  const tokenList = getTokenList(network);

  try {
    const contractCallContext: ContractCallContext[] = tokenList.map(
      (token) => ({
        reference: token.tokenSymbol!,
        contractAddress: token.tokenAddress!,

        abi: ERC20__factory.abi,
        calls: [
          {
            reference: token.tokenSymbol!,
            methodName: "balanceOf",
            methodParameters: [address],
          },
          {
            reference: token.tokenAddress!,
            methodName: "decimals",
            methodParameters: [],
          },
        ],
      })
    );

    const response = await multicall(provider, network).call(
      contractCallContext
    );

    const result = Object.entries(response.results).reduce(
      (prev, [token, data]) => {
        const [balance] = data.callsReturnContext[0].returnValues;
        const [decimals] = data.callsReturnContext[1].returnValues;
        prev[token] = formatUnits(balance, decimals);
        return prev;
      },
      {} as Record<string, string>
    );

    return result;
  } catch (e) {
    console.error(e);
    return tokenList.reduce((prev, cur) => {
      prev[cur.tokenSymbol!] = "0";
      return prev;
    }, {} as Record<string, string>);
  }
};

const multicallService = {
  getTokenBalances,
};

export default multicallService;
