import { useManagerLogin } from "~/hooks/useManagerLogin";
import Logo from "../../../../public/assets/phc_pay_logo_navbar.png";
import { useWalletConnectLogin } from "~/hooks/useWalletConnectLogin";
import { useConnect } from "wagmi";

export default function ManagerConnectWallet() {
  const handleConnect = useManagerLogin();
  const handleWalletConnect = useWalletConnectLogin();
  const [{ data: connectData, error: connectError }, connect] = useConnect();

  return (
    <>
      <div className="flex items-center justify-center gap-10">
        <div className="wallet-pay mt-10 flex flex-col space-y-3 rounded-md p-8 shadow-md md:w-96">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-7 py-10">
              <div className="flex justify-center space-x-2 text-xl font-bold text-gray-700 lg:text-3xl">
                <img src={Logo} alt="transcrypt logo" className="w-30 h-10" />

                <span className="text-white">Merchant</span>
              </div>
              <button
                onClick={handleConnect}
                type="submit"
                className="hover:bg-white-700 text-smfont-medium inline-flex w-full justify-center rounded-full border border-transparent bg-primary-yellow p-8 px-5 py-5 text-black shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
              >
                <div className="flex flex-row space-x-5">
                  <div>
                    <img
                      src="/assets/metamask-logo.png"
                      alt="metamask logo"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex items-center  justify-center text-xl font-bold  text-white">
                    MetaMask
                  </div>
                </div>
              </button>
              <div>
                {connectData.connectors.map((connector, index) => (
                  <div className="" key={index}>
                    {connector.name == "WalletConnect" ? (
                      <button
                        type="submit"
                        className="hover:bg-white-700 text-smfont-medium inline-flex w-full justify-center rounded-full border border-transparent bg-primary-yellow p-8 px-5 py-5 text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                          <div className="flex items-center  justify-center text-xl font-bold  text-white">
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
        </div>
      </div>
    </>
  );
}
