import { useAccount, useConnect } from "wagmi";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "@remix-run/react";
import { useIsMounted } from "~/hooks";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";
import MainLogo from "../../public/assets/PHC_Pay_icon.png";
import { useEffect } from "react";

type PropsType = {
  redirectPath: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConnect?: () => void;
};

export default function LoginModal({
  redirectPath = "/",
  isOpen,
  setIsOpen,
  onConnect,
}: PropsType) {
  const { t } = useTranslation("login");

  const navigate = useNavigate();
  const isMounted = useIsMounted();

  const [
    {
      data: { connector, connectors },
      loading,
    },
    connect,
  ] = useConnect();
  const [{ data }, disconnect] = useAccount();

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth) {
      eth.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const selectWallet = (wallet: string) => {
    if (wallet === "MetaMask") {
      return (
        <>
          <img
            src="/assets/metamask-logo.png"
            className="h-10 w-10"
            alt={wallet}
          />
        </>
      );
    }

    return (
      <>
        <img
          src="/assets/wallet-logo.png"
          className="h-10 w-10 rounded-full"
          alt={wallet}
        />
      </>
    );
  };

  const showLoginMethods = () => {
    if (typeof window.ethereum !== "undefined") {
      return connectors
        .filter((e) => e.ready)
        .map((x) => {
          return (
            <button
              key={x.name}
              className="mb-4 flex h-12 w-48 items-center justify-around rounded-full bg-white p-2 text-center shadow-md"
              onClick={async () => {
                disconnect();
                await connect(x);
                if (typeof window.ethereum === "undefined") {
                  window.location.href = `https://metamask.app.link/dapp/${window.location.href}`;
                } else {
                  onConnect && onConnect();
                }
                navigate(redirectPath);
                setIsOpen(false);
              }}
            >
              {selectWallet(x.name)}
              <span>{x.name}</span>
            </button>
          );
        });
    }
    return (
      <button
        className="mb-4 flex h-12 w-48 items-center justify-around rounded-full bg-white p-2 text-center shadow-md"
        onClick={async () => {
          if (typeof window.ethereum === "undefined") {
            window.location.href = `https://metamask.app.link/dapp/${window.location.href}`;
          }
        }}
      >
        {selectWallet("MetaMask")}
        <span>MetaMask</span>
      </button>
    );
  };

  return (
    <>
      <Transition appear show={isOpen}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 mb-20 h-screen overflow-y-auto bg-dialog-black"
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-900 opacity-50" />
            </Transition.Child>
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="wallet-pay my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col items-center justify-center rounded-md bg-primary-black-gray py-10">
                  <img src={MainLogo} alt="logo" width={222} />

                  <p className="py-10 text-white">
                    {t("please_select_a_wallet")}
                  </p>
                  {isMounted && (
                    <>
                      <div className="hidden lg:block">
                        {showLoginMethods()}
                      </div>
                      <div className="block lg:hidden">
                        {!connectors?.find((e) => e.name === "MetaMask")
                          ?.ready ? (
                          <button
                            className="mb-4 flex h-12 w-48 items-center justify-around rounded-full p-2 text-center text-white shadow-md"
                            onClick={async () => {
                              window.location.href = `https://metamask.app.link/dapp/${window.location.href}`;
                            }}
                          >
                            {selectWallet("MetaMask")}
                            <span className="text-white">MetaMask</span>
                          </button>
                        ) : (
                          <>
                            {connectors
                              .filter((e) => e.ready)
                              .map((x) => {
                                return (
                                  <button
                                    key={x.name}
                                    className="mb-4 flex h-12 w-48 items-center justify-around rounded-full border-primary-yellow bg-white p-2 text-center shadow-md"
                                    onClick={async () => {
                                      await connect(x);
                                      onConnect && onConnect();
                                      if (
                                        typeof window.ethereum === "undefined"
                                      ) {
                                        window.location.href = `https://metamask.app.link/dapp/${window.location.href}`;
                                      } 
                                      navigate(redirectPath);
                                      setIsOpen(false);
                                    }}
                                  >
                                    {selectWallet(x.name)}
                                    <span>{x.name}</span>
                                  </button>
                                );
                              })}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
