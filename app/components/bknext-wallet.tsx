import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { shorten } from "~/utils/shorten";
import { useTranslation } from "react-i18next";
import useBKNextStore from "~/stores/bknext-store";

interface IProps {
  onClick?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  redirectTo?: string;
}

export default function BKNextWallet({
  onDisconnect,
}: IProps): JSX.Element {
  const { t } = useTranslation("common");

  const bkNextAddress = useBKNextStore(state => state.bkNextAddress);
  const logoutBitkubNext = useBKNextStore(state => state.logoutBitkubNext);

  const handleLogout = () => {
    logoutBitkubNext();
    onDisconnect && onDisconnect();
  };

  // no wallet connected - user select a wallet to connect
  if (!bkNextAddress) {
    return <div></div>
  }

  // wallet connected
  return (
    <>
      <div className="md:block">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button
              className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 bg-blue-900`}
            >
              <span>
                KUB Chain
              </span>
              <span className="ml-2">({shorten(bkNextAddress)})</span>
              <ChevronDownIcon
                className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                aria-hidden="true"
              />
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
            <Menu.Items className="absolute right-0 top-8 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <div>
                      <button
                        className={`${active ? "bg-blue-500 text-white" : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  );
}
