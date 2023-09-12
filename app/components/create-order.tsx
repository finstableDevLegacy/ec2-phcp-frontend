import { useEffect, useState } from "react";
import { LoaderFunction, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useNetwork } from "wagmi";
import { getFiatCurrencyList } from "~/api/exchange-rate";
import { getTokenList } from "~/constants/tokens";
import { FiatCurrencyType } from "~/type/currency";
import { TokenType } from "~/type/token";
import Loading from "./loading";
import SelectCurrency from "./select-currency";
import TokenListbox from "./ui/tokenListbox";

export const loader: LoaderFunction = async ({ request }) => {
  // const isUser = await requireUser(request);
  const fiatCurrency = await getFiatCurrencyList();
  return fiatCurrency as FiatCurrencyType[];
};

export default function CreateOrder() {
  const fiatCurrency = useLoaderData<FiatCurrencyType[]>();
  const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrencyType>(
    () => fiatCurrency.find((c) => c.symbol === "THB")!
  );
  const [exchangeRate, setExchangeRate] = useState({ value: 0, rate: 0 });
  const [isCreateOrder, setIsCreateOrder] = useState(false);

  const [network] = useNetwork();
  const tokens = getTokenList(network.data.chain?.id!);

  const [selected, setSelected] = useState(tokens[0]);

  return (
    <div className="flex items-center justify-center gap-10">
      <div className="z-20 mt-10 flex flex-col space-y-3 rounded-md border bg-white p-8 shadow-md md:w-96">
        <h1 className="text-center text-xl font-bold text-broker-blue">
          Creater New Order
        </h1>
        <div className="">
          <form className="max-w-md">
            <div className="grid grid-cols-1 gap-6">
              {/* <ToggleReceive
                   enabled={isReceiveFiat}
                   setEnabled={setIsReceiveFiat}
                 /> */}
              <div className="">
                <label htmlFor="Enter product price" className="block">
                  <span className="text-gray-700">Enter product price</span>
                </label>

                <div className="relative">
                  <input
                    id="price"
                    name="price"
                    type="number"
                    className="mt-3 mb-2 block w-full rounded-full border border-gray-400 py-3 pl-5 pr-28 shadow-sm [appearance:textfield] focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    step="any"
                    required
                    //   onChange={(e) => setPrice(+e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-1 text-gray-500">
                    <SelectCurrency
                      currencies={fiatCurrency}
                      selectedCurrency={selectedCurrency}
                      setSelectedCurrency={setSelectedCurrency}
                    />
                  </div>
                </div>
                {selectedCurrency.symbol !== "USD" ? (
                  <label htmlFor="price" className="block">
                    <span className="text-gray-700">
                      Rate: 1 USD = {exchangeRate.rate}{" "}
                      {selectedCurrency.symbol}
                    </span>
                  </label>
                ) : (
                  <>&nbsp;</>
                )}
              </div>
              <label
                htmlFor="Select token to receive mb-0 pb-0"
                className="block"
              >
                <span className="mb-0 pb-0 text-gray-700">
                  Select token to receive
                </span>
              </label>
              <TokenListbox
                selected={selected}
                setSelected={setSelected}
                tokens={tokens}
              />
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isCreateOrder ? (
                  <>
                    <Loading />
                    Processing...
                  </>
                ) : (
                  "Create QR"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
