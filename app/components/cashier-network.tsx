import { getChains } from "~/config/network";
import { Menu, Transition } from "@headlessui/react";
import { chainLogo } from "~/chains";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { Fragment, useEffect, useState } from "react";
import useCashierStore from "~/stores/cashier-store";
import { Chain, useNetwork } from "wagmi";
import { useTranslation } from "react-i18next";

export default function CashierNetwork() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [{ data: networkData }] = useNetwork();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const chainData = getChains((window as any).ENV.ENV);
      setChains(chainData?.chains || []);
    }
  }, [getChains]);

  const selectedChainId = useCashierStore((state) => state.selectedChainId);
  const setSelectedChainId = useCashierStore(
    (state) => state.setSelectedChainId
  );
  const getSelectedChain = useCashierStore((state) => state.getSelectedChain);
  const selectedChain = getSelectedChain();
  const isUnsupportedNetwork = chains?.find(
    (chain) => chain.id === networkData.chain?.id
  )
    ? false
    : true;
  return (
    <Menu
      as="div"
      className="relative mt-4 rounded-full bg-primary-yellow font-medium shadow-md"
    >
      <div className="rounded-full border border-gray-500 bg-white shadow-lg">
        <Menu.Button className="ml-5 flex items-center justify-between whitespace-nowrap px-2 py-2 text-base text-white sm:text-xs md:text-xs">
          <div className="flex items-center justify-center gap-3">
            {isUnsupportedNetwork ? (
              <span className="text-lg font-bold text-primary-yellow">
                {t("please_change_network")}
              </span>
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center text-primary-yellow">
                  <img
                    className=""
                    src={chainLogo[networkData.chain?.id!]}
                    alt=""
                  />
                </div>
                <span className="text-lg font-bold text-primary-yellow">
                  {selectedChain?.name}
                </span>
              </>
            )}
          </div>
          <div>
            <ChevronDownIcon className="h-5 w-5" />
          </div>
        </Menu.Button>
      </div>
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
                        setSelectedChainId(item.id);
                      }}
                      className={`mx-2 inline-flex overflow-auto rounded-md px-2 py-2 text-left ${
                        item.id === selectedChain?.id
                          ? "bg-primary-yellow text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {/* <div className="flex h-6 w-6 items-center justify-center">
                          <img className="" src={chainLogo[item.id]} alt="" />
                        </div> */}
                        <span>{item.name}</span>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
