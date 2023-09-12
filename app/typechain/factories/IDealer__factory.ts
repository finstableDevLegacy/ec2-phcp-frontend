/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IDealer, IDealerInterface } from "../IDealer";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_feeType",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_buyer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_seller",
        type: "address",
      },
    ],
    name: "createOrderSellTrusted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IDealer__factory {
  static readonly abi = _abi;
  static createInterface(): IDealerInterface {
    return new utils.Interface(_abi) as IDealerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDealer {
    return new Contract(address, _abi, signerOrProvider) as IDealer;
  }
}
