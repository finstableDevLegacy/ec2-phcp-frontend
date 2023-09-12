import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import MainLogo from "../../../../public/assets/PHC_Pay_icon.png";
import { useWalletConnectLogin } from "~/hooks/useWalletConnectLogin";
import { useConnect } from "wagmi";

import { useManagerLogin } from "~/hooks/useManagerLogin";

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
  const handleWalletConnect = useWalletConnectLogin();
  const [{ data: connectData, error: connectError }, connect] = useConnect();

  const handleConnect = useManagerLogin();

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
                  <button
                    onClick={() => {
                      handleConnect();
                      if (typeof window.ethereum === "undefined") {
                        window.location.href = `https://metamask.app.link/dapp/${window.location.href}`;
                      } else {
                        onConnect && onConnect();
                      }
                    }}
                    type="submit"
                    className="m-4 flex h-12 w-48 items-center justify-around rounded-full bg-white p-2 text-center shadow-md"
                  >
                    {selectWallet("MetaMask")}
                    <span className="">MetaMask</span>
                  </button>
                  <div>
                    {connectData.connectors.map((connector, index) => (
                      <div className="" key={index}>
                        {connector.name == "WalletConnect" ? (
                          <button
                            type="submit"
                            className="hover:bg-white-700 m-4 inline-flex h-14 w-48 justify-center rounded-full  bg-white  p-2 text-center text-black shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={async () => {
                              await connect(connectData.connectors[1]);
                              await handleWalletConnect();
                            }}
                          >
                            <div className="flex flex-row space-x-5">
                              <div>
                                <img
                                  src="/assets/wallet-logo2.png"
                                  alt="welletconnect logo"
                                  width={40}
                                  height={40}
                                />
                              </div>
                              <div className="text-md flex items-center justify-center  text-black">
                                {connector.name}
                                {!connector.ready && " (unsupported)"}
                              </div>
                            </div>
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
