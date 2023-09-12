import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getFiatCurrencyList } from "~/api/exchange-rate";
import { FiatCurrencyType } from "~/type/currency";
import { useTranslation } from "react-i18next";
import SelectListBox from "~/components/ui/payment-listbox";
import { getCashierUser } from "~/utils/cashier-session.server";
import { MemberDetail } from "~/type/member";
import { PaymentOutput } from "~/enums/payment-output";
import _ from "lodash";
import CashierCardToken from "~/components/merchant/cashier/cashier-card-token";
import { useEffect, useState } from "react";
import { getUserToken } from "~/utils/session.server";
import { LoadingPage } from "~/components/loading-page";
import CashierCardFiat from "~/components/merchant/cashier/cashier-card-fiat";
import SelectCurrency from "~/components/select-currency";
import { getMyPaymentOptions } from "~/api/merchant/payment-option";
import { RENDERMODECASHIER } from "~/type/cashier/cashier-mode.type";
import { getManagerCashierData } from "~/api/merchant/cashier";
import { getBankProfileByCashier } from "~/api/merchant/bankprofile";
import MenuSociol from "~/components/landing/MenuSocial";

type LoaderData = {
  cashierData: {
    user: MemberDetail;
    isExpired: boolean;
  };
  // defaultChain: Chain
  fiatCurrency: FiatCurrencyType[];
  userToken: string;
};

export let handle = {
  i18n: ["index"],
};

export const loader: LoaderFunction = async ({ request }) => {
  const fiatCurrency = await getFiatCurrencyList();
  const user = await getCashierUser(request);
  try {
    const userToken = await getUserToken(request);
    return {
      cashierData: user,
      fiatCurrency,
      userToken,
    } as LoaderData;
  } catch (err) {
    return redirect("/merchant/cashier/login");
  }
};

type PaymentOptionType = {
  id: string;
  name: PaymentOutput;
};

export default function Index() {
  const { t } = useTranslation("index");
  const { fiatCurrency, userToken, cashierData } = useLoaderData<LoaderData>();
  // const [paymentOutput, setPaymentOutput] = useState<PaymentOutput>(
  //   PaymentOutput.TOKEN
  // );
  const [price, setPrice] = useState<number | null>(null);
  const [isShowMessage, setIsShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [paymentOptions, setPaymentOptions] = useState<PaymentOptionType[]>([]);
  const [selectedPaymentOption, setSelectedPaymentOption] =
    useState<PaymentOutput | null>(null);
  const [isShowPaymentOption, setIsShowPaymentOption] = useState(false);
  const [isCashierId, setIsCashierId] = useState(false);
  const [renderMode, setRenderMode] = useState(RENDERMODECASHIER.TOKEN);

  // let selectedChain =
  //   !data.chain?.id || (data.chain?.id && data.chain?.unsupported)
  //     ? defaultChain.id
  //     : data.chain.id

  const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrencyType>(
    () => fiatCurrency.find((c) => c.symbol === "THB")!
  );

  useEffect(() => {
    callApi();
  }, []);

  const getApi = async () => {
    try {
      let cashierId = cashierData?.user?.id;
      if (!cashierId) {
        const { id } = await getManagerCashierData();
        cashierId = id;
      }

      let fetchedPaymentOptionsAndDefault = await getMyPaymentOptions(
        cashierId
      );
      fetchedPaymentOptionsAndDefault = fetchedPaymentOptionsAndDefault.filter(
        (payment) =>
          [PaymentOutput.FIAT, PaymentOutput.TOKEN].includes(payment?.name)
      );
      const fetchedPaymentOptions = fetchedPaymentOptionsAndDefault.filter(
        ({ isSelected }) => isSelected
      );
      const fetchedDefaultOption = fetchedPaymentOptionsAndDefault.find(
        ({ isDefault }) => isDefault
      );
      if (fetchedPaymentOptions.length > 1) {
        setIsShowPaymentOption(true);
      }
      if (fetchedDefaultOption) {
        if (fetchedDefaultOption?.name === PaymentOutput.FIAT) {
          setSelectedPaymentOption(fetchedDefaultOption.name);
        } else if (fetchedDefaultOption?.name === PaymentOutput.TOKEN) {
          setSelectedPaymentOption(fetchedDefaultOption.name);
        }
      }
      setPaymentOptions(fetchedPaymentOptions);
      const fetchedBankProfile = await getBankProfileByCashier(cashierId);
      if (!fetchedBankProfile) {
        setSelectedPaymentOption(PaymentOutput.TOKEN);
        setIsShowPaymentOption(false);
        setIsShowMessage(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const callApi = async () => {
    try {
      setIsLoading(true);
      await getApi();
      setIsLoading(false);
      setIsError(false);
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedPaymentOption === PaymentOutput.TOKEN) {
      setRenderMode(RENDERMODECASHIER.TOKEN);
    } else if (selectedPaymentOption === PaymentOutput.FIAT) {
      setRenderMode(RENDERMODECASHIER.FIAT);
    }
  }, [selectedPaymentOption]);

  const renderPaymentBox: () => JSX.Element = () => {
    if (isShowPaymentOption) {
      return (
        <div>
          <label htmlFor="Select token to receive mb-0 pb-0" className="block">
            <span className="mb-0 pb-0 text-primary-yellow">
              {t("select_payment_output")}
            </span>
          </label>
          <SelectListBox
            items={paymentOptions.map(({ name }) => name)}
            selected={selectedPaymentOption as PaymentOutput}
            setSelected={setSelectedPaymentOption}
          />
        </div>
      );
    }
    return <></>;
  };

  const renderByRenderMode: () => JSX.Element = () => {
    if (renderMode === RENDERMODECASHIER.TOKEN) {
      return (
        <CashierCardToken
          isCashierId={isCashierId}
          cashierData={cashierData}
          price={price as number}
          selectedCurrency={selectedCurrency}
          paymentOutput={PaymentOutput.TOKEN}
        />
      );
    } else if (renderMode === RENDERMODECASHIER.FIAT) {
      return (
        <CashierCardFiat
          isCashierId={isCashierId}
          setSelectedPaymentOption={setSelectedPaymentOption}
          selectedCurrency={selectedCurrency}
          price={price as number}
          paymentOutput={PaymentOutput.FIAT}
          cashierData={cashierData}
        />
      );
    } else {
      return <></>;
    }
  };

  const renderLoading = () => {
    if (isLoading) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="w-full md:w-1/2">
            <LoadingPage />
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  const renderError = () => {
    return (
      <>
        <div className="flex items-center justify-center gap-10">
          <div className="mt-5 flex flex-col space-y-3 rounded-md border bg-white p-8 shadow-md md:w-96">
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-1/5 w-1/5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-center text-2xl font-bold text-primary-black">
              {t("error")}
            </h1>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-black px-4 py-2 text-sm font-medium text-white 
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
              onClick={callApi}
            >
              {t("click_to_refresh")}
            </button>
          </div>
        </div>
      </>
    );
  };

  // BUSD/THB = 33.71915482000001 | VALUE: 2.965080368500178
  // BUSD/PHCP = 1.002005010021042086
  // RATE: PHCP/THB = 33.71915482000001 * 1.002005010021042086 = 33.7867620633

  if (isLoading) {
    return <>{renderLoading()}</>;
  } else if (isError) {
    return <>{renderError()}</>;
  } else {
    return (
      <>
        <div className="flex items-center justify-center gap-10">
          <div className="wallet-pay mt-5 flex flex-col space-y-3 rounded-md border border-primary-black-gray bg-white p-8 shadow-md md:w-96">
            <div>
              <h1 className="text-center text-2xl font-bold text-primary-yellow">
                {t("create_new_order")}
              </h1>
              <div className="">
                <form className="max-w-md">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="mt-10">
                      <label htmlFor="Enter product price" className="block">
                        <span className="text-primary-yellow">
                          {t("enter_product_price")}
                        </span>
                      </label>

                      <div className="relative">
                        <input
                          id="price"
                          name="price"
                          type="number"
                          placeholder="100"
                          className="mt-3 mb-2 block w-full rounded-full border-primary-yellow bg-primary-yellow py-3 pl-5 pr-28 text-white shadow-sm [appearance:textfield] focus:border-primary-yellow focus:ring focus:ring-primary-yellow focus:ring-opacity-50"
                          step="any"
                          required
                          // min={0}
                          onChange={({ target: { value } }) => {
                            if (+value > 0) {
                              setPrice(+value);
                            } else {
                              setPrice(null);
                            }
                          }}
                          value={`${price}`}
                        />
                        <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-1 text-gray-500">
                          <SelectCurrency
                            currencies={fiatCurrency}
                            selectedCurrency={selectedCurrency}
                            setSelectedCurrency={setSelectedCurrency}
                          />
                        </div>
                      </div>
                    </div>
                    {/* {renderPaymentBox()} */}
                    {renderByRenderMode()}
                    {isShowMessage ? (
                      <>
                        <div>
                          <p>please add bank information for use fiat</p>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20 flex flex-col items-center justify-center p-5 pb-5 sm:grid-cols-2">
          <h3 className="text-xl font-light text-primary-yellow">
            {t("follow_us")}
          </h3>
          <MenuSociol />
        </div>
      </>
    );
  }
}
