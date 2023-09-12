import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface IProps {
  selected: IChains;
  chains: IChains[];
  setSelected: (value: IChains) => void;
}

interface IChains {
  logoUri: string;
  name: string;
}

export default function ListBoxChain(props: IProps): JSX.Element {
  const { selected, chains, setSelected } = props;

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative z-30">
        <Listbox.Button className="relative w-44 cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <span className="flex items-center truncate text-sm">
            <img
              src={selected.logoUri}
              alt={selected.name}
              className="h-5 w-5"
            />
            <div className="ml-2">{selected.name}</div>
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-2 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <div className="mb-2">Select network</div>
            {chains.map((chain, chainIdx) => (
              <Listbox.Option
                key={chainIdx}
                className={({ active }) =>
                  `relative mb-2 cursor-default select-none rounded bg-gray-200 py-2 px-1 `
                }
                value={chain}
              >
                {({ selected }) => (
                  <>
                    <div
                      className={`flex items-center truncate ${
                        selected ? "" : ""
                      }`}
                    >
                      <img
                        src={chain.logoUri}
                        alt={chain.name}
                        className="h-5 w-5"
                      />
                      <div className="ml-2 text-xs">{chain.name}</div>
                    </div>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
