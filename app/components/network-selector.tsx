import { Chain, useNetwork } from "wagmi";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import metamaskService from "~/services/metamask";
import { chainLogo } from "~/chains";

export default function NetworkSelector({ chains }: { chains: Chain[] }) {
  const [{ data: networkData }] = useNetwork();
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className={`absolute top-8 mt-4 origin-top-right divide-gray-100 rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
      >
        <div className="grid w-48 grid-rows-1 gap-2">
          {chains?.length &&
            chains.map((item) => (
              <Menu.Item key={item.id}>
                {({ active }) => (
                  <button
                    onClick={async () => {
                      await metamaskService.switchNetwork(item);
                      window.location.reload();
                    }}
                    className={`mx-2 inline-flex overflow-auto rounded-md px-2 py-2 text-left ${
                      item.id === networkData.chain?.id
                        ? "bg-primary-yellow text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center">
                        <img className="" src={chainLogo[item.id]} alt="" />
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
        </div>
      </Menu.Items>
    </Transition>
  );
}
