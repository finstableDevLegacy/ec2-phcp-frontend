import { hexValue } from "ethers/lib/utils";
import { Chain } from "wagmi";

interface Window {
  ethereum: any;
}

const formatEthereumChainParameter = (chain: Chain) => {
  const result = {
    chainId: hexValue(chain.id),
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls,
    blockExplorerUrls: chain.blockExplorers?.map((exp) => exp.url),
  };
  return result;
};

const switchNetwork = async (chain: Chain) => {
  const eth = (window as Window).ethereum;
  const chainParam = formatEthereumChainParameter(chain);
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainParam.chainId }],
    });
  } catch (switchError) {
    try {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [chainParam],
      });
    } catch (addError) {
      // handle "add" error
    }
    // handle other "switch" errors
  }
};

const metamaskService = {
  switchNetwork,
};

export default metamaskService;
