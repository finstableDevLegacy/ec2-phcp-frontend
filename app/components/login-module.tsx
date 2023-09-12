import { useConnect } from "wagmi";
import { useNavigate } from "@remix-run/react";
import { useIsMounted } from "~/hooks";
import { useTranslation } from "react-i18next";
import MainLogo from "../../public/assets/main-logo.png";

export default function LoginModule() {
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
    <div>
      <div className="flex h-full items-center justify-center">
        <div className="mt-36 flex flex-col items-center justify-center rounded-md bg-primary-black-gray py-10 px-20 shadow-lg shadow-broker-grey/20">
          {/* <Link to="/"> */}
          <img src={MainLogo} alt="logo" width={222} />
          {/* </Link> */}
          <p className="py-10">{t("please_select_a_wallet")}</p>
          {isMounted && (
            <div>
              {connectors
                .filter((e) => e.ready)
                .map((x) => {
                  return (
                    <button
                      key={x.name}
                      className="mb-4 flex h-12 w-48 items-center justify-around rounded-full p-2 text-center shadow-md"
                      onClick={async () => {
                        await connect(x);
                        // onConnect && onConnect();
                        // navigate(redirectPath);
                      }}
                    >
                      {selectWallet(x.name)}
                      <span>{x.name}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
