import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Listbox, Transition, Combobox } from "@headlessui/react";
import { CheckIcon, SelectorIcon, SearchIcon } from "@heroicons/react/solid";
import { FiatCurrencyType } from "~/type/currency";

export default function SelectCurrency({
  currencies,
  selectedCurrency,
  setSelectedCurrency,
}: {
  currencies: FiatCurrencyType[];
  selectedCurrency: FiatCurrencyType;
  setSelectedCurrency: Dispatch<SetStateAction<FiatCurrencyType>>;
}) {
  const [query, setQuery] = useState("");
  const filteredCurrencies =
    query === ""
      ? currencies
      : currencies.filter(
          (currency) =>
            currency.name
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, "")) ||
            currency.symbol
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <div className="">
      <Combobox value={selectedCurrency} onChange={setSelectedCurrency}>
        <div className="relative">
          <div className="relative cursor-default py-2 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center">
              <div className=" flex bg-primary-black-gray rounded-full border-2 border-primary-black-gray px-3 py-2 text-white">
                <p className="font-bold">{selectedCurrency.symbol}</p>
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <div className="absolute right-0 mt-5 max-h-60 w-72 rounded-md border bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="p-2">
                <div className="flex items-center space-x-1 border px-2">
                  <SearchIcon className="h-4 w-4 text-gray-900" />
                  <Combobox.Input
                    className="w-full border-none pl-1 text-sm leading-5 text-gray-900 focus:ring-0"
                    displayValue={(currency: FiatCurrencyType) =>
                      currency.symbol
                    }
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </div>
              <Combobox.Options className="max-h-44 overflow-auto">
                {filteredCurrencies.length === 0 && query !== "" ? (
                  <div className="relative mt-2 cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredCurrencies.map((currency) => (
                    <Combobox.Option
                      key={currency.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-blue-600 text-white" : "text-gray-900"
                        }`
                      }
                      value={currency}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {currency.name} ({currency.symbol})
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-primary-black"
                              }`}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Transition>
        </div>
      </Combobox>
    </div>
  );

  // return (
  //   <div className="w-[70px]">
  //     <Listbox value={selectedCurrency} onChange={setSelectedCurrency}>
  //       <div className="relative z-0">
  //         <Listbox.Button className="relative w-full cursor-default py-2 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
  //           <span className="block truncate text-base text-gray-800">
  //             {selectedCurrency.name}
  //           </span>
  //           <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
  //             <SelectorIcon
  //               className="h-5 w-5 text-gray-800"
  //               aria-hidden="true"
  //             />
  //           </span>
  //         </Listbox.Button>
  //         <Transition
  //           as={Fragment}
  //           leave="transition ease-in duration-100"
  //           leaveFrom="opacity-100"
  //           leaveTo="opacity-0"
  //         >
  //           <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
  //             {currency.map((cur, curIdx) => (
  //               <Listbox.Option
  //                 key={curIdx}
  //                 className={({ active }) =>
  //                   `${
  //                     selectedCurrency.name === cur.name || active
  //                       ? "bg-blue-100 text-blue-900"
  //                       : "text-gray-900"
  //                   }
  //                     relative cursor-default select-none py-2 pl-8`
  //                 }
  //                 value={cur}
  //               >
  //                 {({ selected, active }) => (
  //                   <>
  //                     <span
  //                       className={`${
  //                         selected ? "font-medium" : "font-normal"
  //                       } block truncate`}
  //                     >
  //                       {cur.name}
  //                     </span>
  //                     {selected ? (
  //                       <span
  //                         className={`${
  //                           active ? "text-blue-600" : "text-blue-600"
  //                         }
  //                               absolute inset-y-0 left-0 flex items-center pl-2`}
  //                       >
  //                         <CheckIcon className="h-5 w-5" aria-hidden="true" />
  //                       </span>
  //                     ) : (
  //                       <>
  //                         {" "}
  //                         {selectedCurrency.name === cur.name ? (
  //                           <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-blue-600">
  //                             <CheckIcon
  //                               className="h-5 w-5"
  //                               aria-hidden="true"
  //                             />
  //                           </span>
  //                         ) : null}
  //                       </>
  //                     )}
  //                   </>
  //                 )}
  //               </Listbox.Option>
  //             ))}
  //           </Listbox.Options>
  //         </Transition>
  //       </div>
  //     </Listbox>
  //   </div>
  // );
}
