import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { Menu } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useAccount, useNetwork } from "wagmi";
import { FC, useState, useEffect } from "react";

// Components
import LoginModal from "~/components/login-modal";

// Utils
import { LogoutIcon } from "@heroicons/react/outline";
import { PayLoaderData } from "~/routes/pay";
import { chainLogo } from "~/chains";
import NetworkSelector from "../../../network-selector";

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
};

const NetworkWallet: FC<IProps> = ({
  onClick,
  onConnect,
  onDisconnect,
  redirectTo,
  activeChainColor = "bg-primary-dark-blue text-white",
  displayOn = DisplayOn.DESKTOP,
}) => {
  const { t } = useTranslation("common");

  const location = useLocation();
  const navigate = useNavigate();

  const { chains } = useLoaderData<PayLoaderData>();

  const [{ data: accountData }, disconnect] = useAccount();
  const [{ data: networkData }, switchNetwork] = useNetwork();

  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const isUnsupportedNetwork = chains?.find(
    (chain) => chain.id === networkData.chain?.id
  )
    ? false
    : true;

  const handleLogout = () => {
    disconnect();
    onDisconnect && onDisconnect();
    if (redirectTo) {
      window.location.reload();
    } else {
      navigate("/logout");
    }
  };

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth) {
      eth.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  if (!accountData?.address) {
    return (
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
            className="mt-5 rounded-full bg-primary-yellow px-4 py-2 font-medium text-white shadow-md lg:mt-0"
          >
            {t("connect_a_wallet")}
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      {displayOn === DisplayOn.DESKTOP && (
        <div className="text-md flex w-full items-center justify-center font-medium">
          <Menu
            as="div"
            className="relative rounded-full bg-white font-medium shadow-md"
          >
            <div className="rounded-full border border-gray-500 shadow-lg">
              <Menu.Button className="flex h-[40px] items-center justify-between px-4 py-2 text-base text-white">
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
            </div>
            <NetworkSelector chains={chains} />
          </Menu>

          {/* Logout */}
          <div className="item-center ml-5 flex">
            <button onClick={handleLogout}>
              <LogoutIcon className="w-6 text-gray-400" />
            </button>
          </div>
        </div>
      )}
      {displayOn === DisplayOn.MOBILE && (
        <div className="flex flex-col divide-y py-5">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-base text-white">
              <div className="flex items-center justify-center gap-3">
                {isUnsupportedNetwork ? (
                  <span className="text-red-500">
                    {t("please_change_network")}
                  </span>
                ) : (
                  <>
                    <div className="flex h-6 w-6 items-center justify-center">
                      <img
                        src={chainLogo[networkData.chain?.id!]}
                        alt="chain logo"
                      />
                    </div>
                    <span className="font-medium text-white">
                      {networkData.chain?.name}
                    </span>
                  </>
                )}
              </div>
            </Menu.Button>
            <NetworkSelector chains={chains} />
          </Menu>

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
      )}
    </>
  );
};

export default NetworkWallet;
