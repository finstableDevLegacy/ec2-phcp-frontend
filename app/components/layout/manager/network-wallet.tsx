import { useLocation, useNavigate } from "@remix-run/react";
import { Menu } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useAccount, useNetwork } from "wagmi";
import { FC, useEffect, useState } from "react";

// Components
import LoginModal from "~/components/views/manager/login-modal";

// Utils
import { ChevronDownIcon, LogoutIcon } from "@heroicons/react/outline";
import useAuthStore from "~/stores/auth-store";
import { chainLogo } from "~/chains";
import NetworkSelector from "~/components/network-selector";

export enum DisplayOn {
  DESKTOP = "Desktop",
  MOBILE = "Mobile",
}

type IProps = {
  onClick?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  redirectTo?: string;
  activeChainColor?: string;
  displayOn?: string;
  isCashier?: boolean;
};

const NetworkWallet: FC<IProps> = ({
  onClick,
  onConnect,
  onDisconnect,
  redirectTo,
  activeChainColor = "bg-primary-dark-blue text-white",
  displayOn = DisplayOn.DESKTOP,
  isCashier,
}) => {
  const { t } = useTranslation("common");

  const location = useLocation();
  const navigate = useNavigate();

  const [{ data: accountData }, disconnect] = useAccount();
  const [{ data: networkData }] = useNetwork();
  const accessToken = useAuthStore((state) => state.managerAccessToken);
  const logoutManager = useAuthStore((state) => state.logoutManager);

  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const chains = networkData.chains;

  const isUnsupportedNetwork =
    !networkData?.chain || networkData?.chain?.unsupported;

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth) {
      eth.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const handleLogout = () => {
    disconnect();
    onDisconnect && onDisconnect();
    logoutManager();
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  return (
    <>
      {!accessToken && !accountData?.address ? (
        <>
          <LoginModal
            redirectPath={`${location.pathname}${location.search}`}
            isOpen={isWalletOpen}
            setIsOpen={setIsWalletOpen}
            onConnect={onConnect}
          />
          <div className="flex justify-center">
            <button
              onClick={() => {
                if (onClick) {
                  onClick();
                } else {
                  setIsWalletOpen(true);
                }
              }}
              className="mt-5 rounded-full bg-primary-yellow px-4 py-2 font-bold text-white shadow-md lg:mt-0"
            >
              {t("connect_a_wallet")}
            </button>
          </div>
        </>
      ) : (
        <div>
          {displayOn === DisplayOn.DESKTOP ? (
            <div className="flex w-full items-center justify-center">
              <div>
                <Menu
                  as="div"
                  className="relative rounded-full bg-white font-bold shadow-md"
                >
                  <Menu.Button className="flex h-[40px] items-center justify-between space-x-2 px-4 py-2 text-base text-white">
                    <div className="flex items-center justify-center gap-1">
                      {isUnsupportedNetwork ? (
                        <span className="text-md w-auto whitespace-nowrap font-bold text-primary-yellow">
                          {t("please_change_network")}
                        </span>
                      ) : (
                        <>
                          <div className="flex h-6 w-6 items-center justify-center">
                            <img
                              className="h-[32px] w-[32px]"
                              src={chainLogo[networkData.chain?.id!]}
                              alt=""
                            />
                          </div>
                          <span className="text-md w-auto whitespace-nowrap font-bold text-primary-yellow">
                            {networkData.chain?.name}
                          </span>
                        </>
                      )}
                    </div>
                  </Menu.Button>
                  <NetworkSelector chains={chains} />
                </Menu>
              </div>

              {/* Logout */}
              {!isCashier && (
                <div className="item-center ml-5 flex">
                  <button onClick={handleLogout}>
                    <LogoutIcon className="w-6 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          ) : displayOn === DisplayOn.MOBILE ? (
            <div className="flex flex-col divide-y py-5">
              <div>
                <Menu as="div" className="relative">
                  <div className="">
                    <Menu.Button
                      className={`text-md truncate text-left font-medium ${
                        isUnsupportedNetwork ? "text-red-500" : ""
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center">
                          <img
                            className=""
                            src={chainLogo[networkData.chain?.id!]}
                            alt=""
                          />
                        </div>
                        <span className="text-white">
                          {isUnsupportedNetwork
                            ? t("please_change_network")
                            : networkData.chain?.name}
                        </span>
                      </div>
                    </Menu.Button>
                  </div>

                  <NetworkSelector chains={chains} />
                </Menu>
              </div>

              {/* Logout */}
              <div className="mt-5 py-5">
                <button
                  onClick={handleLogout}
                  className="text-md font-medium text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default NetworkWallet;
