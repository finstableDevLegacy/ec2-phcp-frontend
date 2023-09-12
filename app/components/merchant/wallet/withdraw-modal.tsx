import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNetwork, useSigner, Chain, useAccount } from "wagmi";
import { ContractTransaction, ethers } from "ethers";
import Big from "big.js";
import { parseUnits } from "ethers/lib/utils";

import { Transcrypt__factory } from "~/typechain";

import { getTokenList } from "~/constants/tokens";
import { getAddressList } from "~/constants/address-list";
import { getBlockScanner } from "~/constants/block-scanner";
import STORAGE_KEYS from "~/constants/storage-key";
import { PaymentOutput } from "~/enums/payment-output";
import { WithdrawState } from "~/enums/withdraw-state";
import { FiatCurrencyType } from "~/type/currency";
import { TokenType } from "~/type/token";
import { MerchantOrder, OrderState, OrderStatus } from "~/type/order";
import { GetBankProfileResponse } from "~/type/bankprofile";
import { GetBestRateContentType } from "~/type/cashier/fiat-purchase-type";

import { getFiatPurchaseRate } from "~/api/merchant/fiat-purchase-rate";
import { getTxHash } from "~/api/order";
import { getFiatCurrencyList } from "~/api/exchange-rate";
import {
  createWithdrawOrder,
  saveWithdrawOrder,
  failWithdrawOrder,
} from "~/api/order";
import { apiUpdateOrderFiatPurchase } from "~/api/dealer/order.api";
import { getBankProfile } from "~/api/merchant/bankprofile";

import { useExchangeRate } from "~/hooks/use-exchange-rate";
import { useManagerInfo } from "~/hooks/useManagerInfo";
import { useApproveToken, useOrderStatus } from "~/hooks";
import { useFeeCustomProvider } from "~/hooks/useFeeCustomProvider";

import { getBNBToken } from "~/utils/get-bnb-token";
import { mapMerchantOrder } from "~/utils/order";
import { formatNumber } from "~/utils/format";
import { shorten } from "~/utils/shorten";
import localService from "~/services/localstorage";
import { tokenAmountHelper } from "~/services/withdraw/withdraw-token-amount";

import ApproveToken from "~/components/approve-token";
import Loading from "~/components/loading";
import LoadingIcon from "~/components/loading-icon";
import ModalBankDetail from "~/components/modalBankDetail";

import useCashierStore from "~/stores/cashier-store";

import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/solid";

type WithdrawModalType = {
  amountWallet: string;
  isTokenReady: boolean;
  symbol: string;
  isOpen: boolean;
  fiatSymbol?: string;
  rateUSDToTHB: number;
  closeModal: () => void;
  trustedOrderSelected?: GetBestRateContentType;
};

const WithdrawModal = ({
  amountWallet,
  isTokenReady,
  symbol,
  isOpen,
  fiatSymbol = "THB",
  rateUSDToTHB,
  closeModal,
  trustedOrderSelected,
}: WithdrawModalType) => {
  const [{ data }] = useNetwork();
  const { chain } = useNetwork()[0].data;
  const [{ data: accountData }] = useAccount();
  const [bankData, setBankData] = useState<GetBankProfileResponse>({
    name: "",
    bankAccountNumber: "",
    bankName: "",
  });
  const { managerData } = useManagerInfo(accountData?.address!);
  const [, getSigner] = useSigner();

  const getSelectedChain = useCashierStore((state) => state.getSelectedChain);
  const [isFeeLoading, fee] = useFeeCustomProvider(getSelectedChain());
  const [state, setState] = useState<WithdrawState>(WithdrawState.Idle);
  const [failMessage, setFailMessage] = useState("");

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [isDisabledWithdraw, setIsDisableWithdraw] = useState(true);
  const [isBankAccount, setIsBankAccount] = useState(false);
  const [isErrorAmountAvailable, setIsErrorAmountAvailable] = useState(false);
  const [isErrorPurchase, setIsErrorPurchase] = useState(false);
  const [isErrorWalletNotEnough, setIsErrorWalletNotEnough] = useState(false);
  const [confirmCheck, setConfirmCheck] = useState(false);

  const [withdrawRange, setWithdrawRange] = useState<number[]>([]);
  const [amountWithdraw, setAmountWithdraw] = useState<number>(0);
  const [priceWithFee, setPriceWithFee] = useState<number>(0);
  const [amountAvailable, setAmountAvailable] = useState<number>(0);
  const [order, setOrder] = useState<MerchantOrder>();

  const tokenList = getTokenList(chain?.id!);
  const defaultToken = tokenList[0] || {};
  const [receiveToken, setReceiveToken] = useState(
    tokenList.filter((item) => item.tokenSymbol === "BUSD")[0]
  ); // BUSD
  const [receiveTokenExchange, setReceiveDefaultTokenExchange] = useState(
    defaultToken as TokenType
  );
  const [payToken, setPayToken] = useState(defaultToken as TokenType);
  const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrencyType>({
    id: 134,
    name: "Thai Baht",
    symbol: "THB",
  });
  const [bestFiatRate, setBestFiatRate] = useState({});

  const { showApprove, fetchApproval } = useApproveToken(
    payToken?.tokenAddress!
  );

  const getDefaultTokenByChainId = (chainId: number) => {
    return getTokenList(chainId).find((token) => token.tokenSymbol === "BUSD");
  };
  const getBestRate = () => {
    try {
      const rateFetch = {
        id: trustedOrderSelected?.id,
        dealerAddress: trustedOrderSelected?.user.address,
        range: [
          +(trustedOrderSelected?.floor || 0),
          +(trustedOrderSelected?.ceiling || 0),
        ],
        getBestRateContent: trustedOrderSelected,
        price: trustedOrderSelected?.price,
      };
      return rateFetch;
    } catch (err: any) {
      console.log(err.response.status);
      setLoadingContent(false);
      if (err.response.status === 400) {
        setState(WithdrawState.Fail);
        setFailMessage("mathOrder");
      } else if (err.response.status === 404 || err.response.status === 500) {
        setState(WithdrawState.Fail);
        setFailMessage("dealerApp");
      }
      return undefined;
    }
  };
  const convertProcessFormat = () => {
    const rateFetch = getBestRate();
    const { calReceiveToken } = convertFiatToToken();
    const format = [
      {
        "Name": `${rateFetch?.getBestRateContent?.user.firstName} ${rateFetch?.getBestRateContent?.user.lastName}`,
        "Address": shorten(rateFetch?.dealerAddress || ""),
        "E-mail": rateFetch?.getBestRateContent?.user.email,
        "Phone": rateFetch?.getBestRateContent?.user.phoneNumber
      },
      {
        "Price": `${formatNumber(rateFetch?.price)} THB/BUSD`,
        "Amount": `${formatNumber(amountWithdraw)} THB`,
        "Fee (0.5%)": `${formatNumber(priceWithFee - amountWithdraw)} THB`,
        "Total": `${formatNumber(priceWithFee)} THB`,
        "Quanity":`≈${calReceiveToken.toFixed(4)} BUSD`
      }
    ];
    return format;
  }
  // Similar with token to token create order
  const convertFiatToToken = () => {
    let calPrice;
    let calReceive;
    const rate = trustedOrderSelected?.price || 0;
    if (amountWithdraw && rate !== 0) {
      // calPrice = Big(amountWithdraw);
      // calReceive = Big(amountWithdraw).div(Big(exchangeRate.rate));
      calPrice = Big(amountWithdraw).mul(Big(1).plus(Big(fee).div(Big(100))));
      calReceive = Big(amountWithdraw)
        .mul(Big(1).plus(Big(fee).div(Big(100))))
        .div(Big(rate));
    }
    // const calReceiveToken = Number(calReceive);
    // const _calPrice = amountWithdraw === 0 ? "0" : Number(calPrice);
    const calReceiveToken = Number(calReceive);
    const calPriceWithFee = amountWithdraw === 0 ? "0" : Number(calPrice);
    return { calReceiveToken, calPriceWirhFee: calPriceWithFee };
  };
  const onCreateNewWithdrawOrder = async (
    calPrice: number | string,
    chainId: number,
    managerData: any,
    amountWithdraw: number
  ) => {
    const rateFetch = getBestRate();
    setAmountAvailable(
      +(rateFetch?.getBestRateContent?.amountAvailable || "0")
    );
    // Condition for check withdraw in each round cannot more than available of amount
    if (
      !rateFetch?.getBestRateContent?.amountAvailable ||
      calPrice > +rateFetch?.getBestRateContent?.amountAvailable
    ) {
      // Show the error
      setIsErrorAmountAvailable(true);
      return;
    }
    const content = JSON.stringify({
      price: calPrice.toString(),
      receiveToken: getDefaultTokenByChainId(chainId)?.tokenSymbol,
      receiveTokenValue: 0,
      exchangeRate: 0,
      currency: selectedCurrency.symbol,
      receiveFiatValue: amountWithdraw.toString(),
      merchantName: managerData.name,
      networkId: chainId,
    });
    const detail = JSON.stringify(bestFiatRate);
    if (accountData?.address) {
      const createData = await createWithdrawOrder({
        merchantAddress: accountData.address,
        amountOut: Number(calPrice),
        tokenSymbol: getDefaultTokenByChainId(chainId)?.tokenSymbol || "",
        networkId: chainId.toString(),
        managerId: managerData.id,
        fee: fee.toString(),
        content,
        paymentOutput: PaymentOutput.FIAT,
        platformType: "phcp",
        detail,
      });
      const orderGroup = {
        orders: mapMerchantOrder(createData.data),
        withdrawOrder: createData.data.withdrawOrder,
      };
      setOrder(orderGroup.orders);
      return orderGroup;
    }
    return;
  };
  const onSubmitWithdraw = async () => {
    setIsDisableWithdraw(true);
    setLoadingWithdraw(true);
    if (amountWithdraw === 0) return;
    if (!managerData || !chain?.id) return;
    const { calReceiveToken, calPriceWirhFee } = convertFiatToToken();
    if (accountData?.address) {
      try {
        // --- create withdraw order of token to fiat and send payload to transcrpyt-backend ---
        const orderGroup = await onCreateNewWithdrawOrder(
          calPriceWirhFee,
          chain.id,
          managerData,
          amountWithdraw
        );
        if (!orderGroup) return;
        const orders = orderGroup.orders;
        const withdrawOrder = orderGroup.withdrawOrder;
        const bnbToken = getBNBToken(tokenList);
        const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const addressList = getAddressList(chain?.id!);
        const { amountIn, amountOut, fiatRateBeforePayRes } =
          await tokenAmountHelper({
            order: orders,
            data,
            payToken, // BUSD
            receiveToken, // BUSD
          });
        if (!fiatRateBeforePayRes?.id) {
          throw new Error("dealer not found");
        }
        // --- call purchase transcrypt contract ---
        const signer = await getSigner();
        const transcrypt = Transcrypt__factory.connect(
          addressList["Transcrypt"],
          signer!
        );
        await apiUpdateOrderFiatPurchase(
          orders.orderId,
          fiatRateBeforePayRes.id,
          String(fiatRateBeforePayRes.price),
          accessToken
        );
        let tx: ContractTransaction;
        //เหรียญเดียวกันไม่ต้องเผื่อ amountInRefetched
        if (payToken === receiveToken) {
          tx = await transcrypt.purchase(
            Number(orders.orderId), // order number
            orders.merchant, // order merchant
            [payToken.tokenAddress!, receiveToken.tokenAddress!], // token address
            parseUnits(amountIn.amount, payToken.tokenDecimal), // amount ...
            parseUnits(amountOut.amount, receiveToken.tokenDecimal), // amount ...
            orders.deadline,
            fiatRateBeforePayRes.dealerAddress
          );
        } else {
          //คนละเหรียญเผื่อ amountIn
          //case phcp ต้องผ่าน bnb
          if (
            payToken?.tokenSymbol === "PHCP" ||
            receiveToken?.tokenSymbol === "PHCP"
          ) {
            tx = await transcrypt.purchase(
              Number(orders.orderId),
              orders.merchant,
              [
                payToken.tokenAddress!,
                bnbToken.tokenAddress!,
                receiveToken.tokenAddress!,
              ],
              parseUnits(`${amountIn.amountPlus}`, payToken.tokenDecimal),
              parseUnits(amountOut.amount, receiveToken.tokenDecimal),
              orders.deadline,
              fiatRateBeforePayRes.dealerAddress
            );
            // For PHCP
            // if (payToken.tokenSymbol === "PHCP") {
            //   await updateContentDiscountPercentage(order.orderId, "10");
            // }
          } else {
            try {
              tx = await transcrypt.purchase(
                Number(orders.orderId),
                orders.merchant,
                [payToken.tokenAddress!, receiveToken.tokenAddress!],
                parseUnits(`${amountIn.amountPlus}`, payToken.tokenDecimal),
                parseUnits(amountOut.amount, receiveToken.tokenDecimal),
                orders.deadline,
                fiatRateBeforePayRes.dealerAddress
              );
            } catch (err) {
              setIsDisableWithdraw(false);
              const res = await failWithdrawOrder(withdrawOrder.id);
              setIsErrorPurchase(true);
              console.error("error purchase");
              throw err;
            }
          }
        }
        const receipt = await tx.wait();
        const event = receipt.events?.find(
          (event) => event.event === "Purchased"
        );
        const receiptEvent = await getTxHash(event as ethers.Event);
        // --- send request to dealer ---
        if (event?.args && receipt?.transactionHash) {
          setOrder({
            ...orders,
            transactionHash: `${getBlockScanner(chain?.id)}/${
              receipt.transactionHash
            }`,
          });
          try {
            const recordWithdrawOrder = await saveWithdrawOrder({
              txHash: receipt.transactionHash,
              orderId: JSON.parse(withdrawOrder.detail).id,
              withdrawId: withdrawOrder.id,
              chainId: orders.networkId,
              price: JSON.parse(withdrawOrder.detail).price,
            });
            // recordWithdrawOrder have withdrawId or status
            if (recordWithdrawOrder?.data?.withdrawId) {
              setState(WithdrawState.Success);
            } else {
              setState(WithdrawState.Retry);
            }
            setLoadingWithdraw(false);
            setIsDisableWithdraw(false);
          } catch (error) {
            // Error: User need to retry the process
            setState(WithdrawState.Retry);
            setIsDisableWithdraw(false);
          }
        }
      } catch (error) {
        console.error("e", error);
        setLoadingWithdraw(false);
        throw error;
      }
    }
  };
  const onClickNextProcess = () => {
    setState(WithdrawState.Prepare);
    setIsDisableWithdraw(true);
    setConfirmCheck(false);
  }

  useEffect(() => {
    if (isTokenReady) {
      const { calReceiveToken, calPriceWirhFee } = convertFiatToToken();
      setPriceWithFee(+calPriceWirhFee || 0);
      if (
        calPriceWirhFee > withdrawRange[1] ||
        calPriceWirhFee < withdrawRange[0] ||
        calPriceWirhFee > amountAvailable ||
        amountWithdraw > +amountWallet
      ) {
        setIsDisableWithdraw(true);
      } else {
        setIsDisableWithdraw(false);
      }
      setIsErrorAmountAvailable(calPriceWirhFee > amountAvailable);
      setIsErrorWalletNotEnough(amountWithdraw > +amountWallet);
    }
  }, [amountWithdraw, selectedCurrency.symbol, receiveToken?.tokenSymbol]);
  useEffect(() => {
    // Note: Reset state to default
    setState(WithdrawState.Idle);
    setIsErrorAmountAvailable(false);
    setIsErrorWalletNotEnough(false);
    setIsErrorPurchase(false);
    setConfirmCheck(false);
    setPriceWithFee(0);
    setAmountWithdraw(0);
    setIsErrorAmountAvailable(false);
    setLoadingWithdraw(false);
    setIsDisableWithdraw(true);
    setPayToken(tokenList.filter((item) => item.tokenSymbol === symbol)[0]);
    // ---- Note: Setup modal info ---
    setLoadingContent(true);
    const chainId = chain?.id;
    const getcallApiGetFiatPurchaseRate = async () => {
      try {
        const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const fetchedBankProfile = await getBankProfile(accessToken);
        if (
          fetchedBankProfile?.name === "" ||
          fetchedBankProfile?.bankAccountNumber === "" ||
          fetchedBankProfile?.bankName === ""
        ) {
          setIsBankAccount(true);
          setIsBankModalOpen(true);
          closeModal();
        } else setIsBankAccount(false);
        // Note: Don't have bank account
        const fiatCurrency = await getFiatCurrencyList();
        setSelectedCurrency(
          () => fiatCurrency?.find((c: any) => c.symbol === "THB")!
        );
        const rateFetch = getBestRate();
        if (!rateFetch?.price) {
          throw new Error("rate not found");
        }
        if (rateFetch?.range) {
          setLoadingContent(false);
        }
        setBestFiatRate(rateFetch);
        setAmountAvailable(
          +(rateFetch?.getBestRateContent?.amountAvailable || 0)
        );
        setWithdrawRange(rateFetch?.range || []);
      } catch (error) {
        console.log(error);
      }
    };
    if (isOpen && isTokenReady) {
      getcallApiGetFiatPurchaseRate();
      if (symbol.length > 0) {
        const token = tokenList.filter(
          (item) => item.tokenSymbol === symbol
        )[0];
        setReceiveDefaultTokenExchange(token);
      }
    }
  }, [isOpen]);

  const errorContent = () => {
    switch (failMessage) {
      case "matchOrder": {
        return (
          <div className="flex flex-col items-center justify-center">
            <ExclamationCircleIcon className="h-32 text-orange-400" />
            <p className="md:text-md text-sm">Not found match Order</p>
          </div>
        );
      }
      case "dealerApp": {
        return (
          <div className="flex flex-col items-center justify-center">
            <ExclamationCircleIcon className="h-32 text-orange-400" />
            <p className="md:text-md text-sm">Dealer app server unavailable</p>
            <p className="md:text-md text-sm">
              Please contract Dealer app support
            </p>
          </div>
        );
      }
    }
  };
  const stateContent = () => {
    switch (state) {
      case WithdrawState.Idle:
        return (
          <>
            <p>{`Amount range: ${formatNumber(
              withdrawRange[0]
            )} - ${formatNumber(withdrawRange[1])} Baht`}</p>
            <p>{`Withdraw available: ${formatNumber(amountAvailable)} Baht`}</p>
            <input
              type="number"
              className="w-full justify-center rounded-md border border-gray-400 px-4 py-2 text-sm text-black shadow-sm [appearance:textfield]
              focus:border-yellow-400 focus:ring focus:ring-yellow-50 focus:ring-opacity-50"
              onChange={(e) => setAmountWithdraw(Number(e.target.value))}
              placeholder="0"
            />
            <div className="flex w-full justify-between self-start">
              <p>{`Fee (${fee}%)`}</p>
              <p>{`${formatNumber(priceWithFee - amountWithdraw)} Baht`}</p>
            </div>
            <div className="flex w-full justify-between self-start">
              <p>Total</p>
              <p>{`${formatNumber(priceWithFee)} Baht`}</p>
            </div>
            {(isErrorAmountAvailable || isErrorWalletNotEnough) && (
              <div className="flex w-full flex-row justify-around items-center border border-red-700 bg-red-500 rounded-md p-2">
                {/* <ExclamationIcon className="h-16"  /> */}
                <p className="text-start text-sm">
                  {isErrorAmountAvailable && (
                    <li>
                      withdraw amount more than is available
                    </li>
                  )}
                  {isErrorWalletNotEnough && (
                    <li>
                      withdraw amount more than your wallet
                    </li>
                  )}
                </p>
              </div>
            )}
          </>
        );
      case WithdrawState.Prepare:
        return (
          <div className="w-full flex flex-col space-y-6">
            <div className="space-y-2">
              <div className="font-bold">Dealer Info</div>
              {Object.entries(convertProcessFormat()[0]).map(([key, value]) => {
                if (key === "Address") {
                  return (
                    <div className="flex justify-between">
                      <p>{key}</p>
                      <p className="text-primary-yellow">{value}</p>
                    </div>
                  );
                }
                return (
                  <div className="flex justify-between">
                    <p>{key}</p>
                    <p>{value}</p>
                  </div>
                )
              })}
            </div>
            <div className="space-y-2">
              <div className="font-bold">Transaction Info</div>
              {Object.entries(convertProcessFormat()[1]).map(([key, value]) => {
                return (
                  <div className="flex justify-between">
                    <p>{key}</p>
                    <p>{value}</p>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center space-x-1">
              <input type="checkbox" checked={confirmCheck} onChange={() => {setConfirmCheck(!confirmCheck); setIsDisableWithdraw(confirmCheck === true);}} />
              <p className="text-xs">I've already checked the transaction and dealer information.</p>
            </div>
            {isErrorPurchase && (
              <div>
                <p className="text-center text-xs md:text-sm text-red-500">
                  Error: withdrawal order doesn't process
                </p>
                <p className="text-center text-xs md:text-sm text-red-500">
                  because bad network connection please try again
                </p>
              </div>
            )}
          </div>
        );
      case WithdrawState.Success:
        return (
          <div className="flex flex-col items-center justify-center">
            <CheckCircleIcon className="h-32 text-green-400" />
            <p>Please wait for truster process transaction</p>
            <p>It will take time 5 min - 1 day</p>
          </div>
        );
      case WithdrawState.Retry:
        return (
          <div className="flex flex-col items-center justify-center">
            <ExclamationCircleIcon className="h-32 text-orange-400" />
            <p className="md:text-md text-sm">
              The order withdrawal process is incomplete
            </p>
            <p className="md:text-md text-sm">
              Please try again in the withdraw history
            </p>
          </div>
        );
      case WithdrawState.Fail:
        return errorContent();
    }
  };
  const stateButton = () => {
    switch (state) {
      case WithdrawState.Idle:
        return (
          <div className="flex w-full justify-center space-x-3">
            <button
              type="button"
              className="inline-flex justify-center rounded-lg   border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium
              text-slate-900 hover:bg-primary-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500
              focus-visible:ring-offset-2"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`inline-flex justify-center rounded-lg   border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium
              text-slate-900 ${
                !isDisabledWithdraw &&
                "hover:bg-primary-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
              }`}
              onClick={onClickNextProcess}
              disabled={isDisabledWithdraw}
            >
              Next
            </button>
          </div>
        );
      case WithdrawState.Prepare:
        return (
          <div className="flex w-full justify-center space-x-3">
            <button
              type="button"
              className="inline-flex justify-center rounded-lg   border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium
              text-slate-900 hover:bg-primary-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500
              focus-visible:ring-offset-2"
              onClick={() => setState(WithdrawState.Idle)}
            >
              Back
            </button>
            <button
              type="button"
              className={`inline-flex justify-center rounded-lg   border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium
              text-slate-900 ${
                !isDisabledWithdraw &&
                "hover:bg-primary-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
              }`}
              onClick={onSubmitWithdraw}
              disabled={isDisabledWithdraw}
            >
              {loadingWithdraw || isFeeLoading ? (
                <>
                  <Loading />
                  processing...
                </>
              ) : (
                "Confirm Withdrawal"
              )}
            </button>
          </div>
        );
      default:
        return (
          <button
            type="button"
            className="inline-flex justify-center rounded-lg   border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium
          text-slate-900 hover:bg-primary-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500
          focus-visible:ring-offset-2"
            onClick={closeModal}
          >
            Close
          </button>
        );
    }
  };
  const modalTitle = () => {
    if (isTokenReady) {
      if (state === WithdrawState.Success) {
        return "Create withdraw order success";
      }
      return "Withdraw Info";
    }
    return `Withdraw with ${symbol} coming soon`;
  };
  const modalContent = () => {
    if (isTokenReady) {
      return (loadingContent || isFeeLoading)? (
        <>
          <LoadingIcon />{" "}
        </>
      ) : (
        stateContent()
      );
    } else return;
  };
  const modalButton = () => {
    if (isTokenReady) {
      return loadingContent ? null : showApprove ? (
        <ApproveToken token={payToken} onApprove={fetchApproval} />
      ) : (
        stateButton()
      );
    } else {
      return (
        <button
          type="button"
          className="inline-flex justify-center rounded-lg   border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium
          text-slate-900 hover:bg-primary-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500
          focus-visible:ring-offset-2"
          onClick={closeModal}
        >
          Cancel
        </button>
      );
    }
  };

  const bankModal = () => {
    return (
      <ModalBankDetail
        isOpen={isBankModalOpen}
        setIsOpen={setIsBankModalOpen}
        data={{
          bankAccountNumber: "",
          name: "",
          bankName: "",
        }}
        setData={setBankData}
      />
    );
  };

  return (
    <>
      {isBankAccount && bankModal()}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-primary-black-gray p-6 text-left align-middle text-white shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="flex justify-center text-lg font-medium leading-6 text-white"
                  >
                    {modalTitle}
                  </Dialog.Title>
                  <div className="mt-4 flex w-full flex-col items-center space-y-3">
                    {modalContent()}
                  </div>
                  <div className="mt-4 flex justify-center">
                    {modalButton()}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default WithdrawModal;
