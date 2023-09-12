import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/outline";
import type { TokenType } from "~/type/token";

interface IProps {
  selected: TokenType;
  tokens: TokenType[];
  setSelected: (value: TokenType) => void;
  message?: string;
}

export default function TokenListbox({
  selected,
  tokens,
  setSelected,
  message,
}: IProps) {
  return (
    <div className="w-full rounded-lg border">
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-lg focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <div
              className={`flex ${
                message ? "justify-between" : "justify-center"
              }`}
            >
              <div className="flex items-center justify-center space-x-5">
                {selected?.tokenLogoUri && (
                  <img
                    src={selected.tokenLogoUri}
                    alt={selected.tokenName}
                    className="h-5 w-5"
                  />
                )}
                <span className="block truncate text-center font-bold">
                  {selected?.tokenSymbol || "Please select token"}
                </span>
              </div>
              {message ? <div>{message}</div> : <></>}
            </div>
            {tokens.length > 1 && (
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            )}
          </Listbox.Button>
          {tokens.length > 1 && (
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {tokens.map((token, tokenIdx) => (
                  <Listbox.Option
                    key={tokenIdx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                      }`
                    }
                    value={token}
                  >
                    {({ selected }) => (
                      <>
                        <div
                          className={`flex items-center truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          <img
                            src={token.tokenLogoUri}
                            alt={token.tokenName}
                            className="h-5 w-5"
                          />
                          <div className="ml-2 text-xs">
                            {token.tokenSymbol}
                          </div>
                        </div>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          )}
        </div>
      </Listbox>
    </div>
  );
}
