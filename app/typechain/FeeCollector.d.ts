/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface FeeCollectorInterface extends ethers.utils.Interface {
  functions: {
    "collectFee(address,uint256,address)": FunctionFragment;
    "fee()": FunctionFragment;
    "feeClaimer()": FunctionFragment;
    "feeDecimals()": FunctionFragment;
    "setFee(uint256)": FunctionFragment;
    "setFeeClaimer(address)": FunctionFragment;
    "shifter()": FunctionFragment;
    "tokenFeeReserves(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "collectFee",
    values: [string, BigNumberish, string]
  ): string;
  encodeFunctionData(functionFragment: "fee", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "feeClaimer",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "feeDecimals",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setFeeClaimer",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "shifter", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenFeeReserves",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "collectFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "fee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "feeClaimer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "feeDecimals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setFee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setFeeClaimer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "shifter", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenFeeReserves",
    data: BytesLike
  ): Result;

  events: {
    "FeeChanged(uint256,uint256)": EventFragment;
    "FeeClaimerChanged(address,address)": EventFragment;
    "FeeCollected(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "FeeChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FeeClaimerChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FeeCollected"): EventFragment;
}

export type FeeChangedEvent = TypedEvent<
  [BigNumber, BigNumber] & { oldFee: BigNumber; newFee: BigNumber }
>;

export type FeeClaimerChangedEvent = TypedEvent<
  [string, string] & { oldFeeClaimer: string; newFeeClaimer: string }
>;

export type FeeCollectedEvent = TypedEvent<
  [string, string, BigNumber] & {
    beneficiary: string;
    token: string;
    amount: BigNumber;
  }
>;

export class FeeCollector extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: FeeCollectorInterface;

  functions: {
    collectFee(
      token: string,
      amount: BigNumberish,
      beneficiary: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    fee(overrides?: CallOverrides): Promise<[BigNumber]>;

    feeClaimer(overrides?: CallOverrides): Promise<[string]>;

    feeDecimals(overrides?: CallOverrides): Promise<[BigNumber]>;

    setFee(
      newFee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setFeeClaimer(
      newFeeClaimer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    shifter(overrides?: CallOverrides): Promise<[BigNumber]>;

    tokenFeeReserves(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  collectFee(
    token: string,
    amount: BigNumberish,
    beneficiary: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  fee(overrides?: CallOverrides): Promise<BigNumber>;

  feeClaimer(overrides?: CallOverrides): Promise<string>;

  feeDecimals(overrides?: CallOverrides): Promise<BigNumber>;

  setFee(
    newFee: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setFeeClaimer(
    newFeeClaimer: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  shifter(overrides?: CallOverrides): Promise<BigNumber>;

  tokenFeeReserves(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    collectFee(
      token: string,
      amount: BigNumberish,
      beneficiary: string,
      overrides?: CallOverrides
    ): Promise<void>;

    fee(overrides?: CallOverrides): Promise<BigNumber>;

    feeClaimer(overrides?: CallOverrides): Promise<string>;

    feeDecimals(overrides?: CallOverrides): Promise<BigNumber>;

    setFee(newFee: BigNumberish, overrides?: CallOverrides): Promise<void>;

    setFeeClaimer(
      newFeeClaimer: string,
      overrides?: CallOverrides
    ): Promise<void>;

    shifter(overrides?: CallOverrides): Promise<BigNumber>;

    tokenFeeReserves(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {
    "FeeChanged(uint256,uint256)"(
      oldFee?: null,
      newFee?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { oldFee: BigNumber; newFee: BigNumber }
    >;

    FeeChanged(
      oldFee?: null,
      newFee?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { oldFee: BigNumber; newFee: BigNumber }
    >;

    "FeeClaimerChanged(address,address)"(
      oldFeeClaimer?: string | null,
      newFeeClaimer?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldFeeClaimer: string; newFeeClaimer: string }
    >;

    FeeClaimerChanged(
      oldFeeClaimer?: string | null,
      newFeeClaimer?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldFeeClaimer: string; newFeeClaimer: string }
    >;

    "FeeCollected(address,address,uint256)"(
      beneficiary?: string | null,
      token?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, string, BigNumber],
      { beneficiary: string; token: string; amount: BigNumber }
    >;

    FeeCollected(
      beneficiary?: string | null,
      token?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, string, BigNumber],
      { beneficiary: string; token: string; amount: BigNumber }
    >;
  };

  estimateGas: {
    collectFee(
      token: string,
      amount: BigNumberish,
      beneficiary: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    fee(overrides?: CallOverrides): Promise<BigNumber>;

    feeClaimer(overrides?: CallOverrides): Promise<BigNumber>;

    feeDecimals(overrides?: CallOverrides): Promise<BigNumber>;

    setFee(
      newFee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setFeeClaimer(
      newFeeClaimer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    shifter(overrides?: CallOverrides): Promise<BigNumber>;

    tokenFeeReserves(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    collectFee(
      token: string,
      amount: BigNumberish,
      beneficiary: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    fee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    feeClaimer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    feeDecimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setFee(
      newFee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setFeeClaimer(
      newFeeClaimer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    shifter(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenFeeReserves(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}