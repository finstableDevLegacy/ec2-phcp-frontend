import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { useAccount, useNetwork } from "wagmi";
import { shorten } from "~/utils/shorten";
import { useLocation, useNavigate } from "@remix-run/react";
import LoginModal from "./login-modal";
import { useTranslation } from "react-i18next";

interface IProps {
  onClick?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  redirectTo?: string;
  onLogout?: () => void;
}

export default function Wallet({
  onClick,
  onConnect,
  onDisconnect,
  redirectTo,
  onLogout,
}: IProps): JSX.Element {
  const [{ data: accountData }, disconnect] = useAccount();
  const [{ data: networkData }, switchNetwork] = useNetwork();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation("common");

  const isUnsupportedNetwork =
    !networkData.chain || networkData.chain.unsupported;

  const handleLogout = () => {
    disconnect();
    onDisconnect && onDisconnect();
    onLogout && onLogout();

    if (redirectTo) {
      navigate(`/logout?redirectTo=${redirectTo}`);
    } else {
      navigate(`/logout`);
    }
  };

  useEffect(() => {
    const eth = window.ethereum as any;
    if (eth) {
      eth.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  // no wallet connected - user select a wallet to connect
  if (!accountData?.address) {
    return (
      <>
        <LoginModal
          redirectPath={location.pathname}
          isOpen={isWalletOpen}
          setIsOpen={setIsWalletOpen}
          onConnect={onConnect}
        />
        <button
          onClick={() => {
            setIsWalletOpen(true);
            if (onClick) onClick();
          }}
          className="rounded-lg bg-broker-blue p-4 text-sm font-medium text-white shadow-md"
        >
          Connect Wallet
        </button>
      </>
    );
  }
  // wallet connected
  return (
    <>
      <div className="md:block">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button
              className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${
                isUnsupportedNetwork ? "bg-red-600" : "bg-primary-yellow"
              }`}
            >
              <span>
                {isUnsupportedNetwork
                  ? t("please_change_network")
                  : networkData.chain?.name}
              </span>
              {!isUnsupportedNetwork && (
                <span className="ml-4">{shorten(accountData?.address)}</span>
              )}
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
                {switchNetwork &&
                  networkData.chains.map((x) =>
                    x.id === networkData.chain?.id ? null : (
                      <Menu.Item key={x.id}>
                        {({ active }) => (
                          <button
                            onClick={async () => {
                              await switchNetwork(x.id);
                              window.location.reload();
                            }}
                            className={`${
                              active
                                ? "bg-blue-500 text-white"
                                : "text-gray-900"
                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                          >
                            Switch to {x.name}
                          </button>
                        )}
                      </Menu.Item>
                    )
                  )}
                <Menu.Item>
                  {({ active }) => (
                    <div>
                      <button
                        className={`${
                          active ? "bg-blue-500 text-white" : "text-gray-900"
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
