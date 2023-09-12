import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useFetcher, useLocation, useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";

interface IProps {
  onClick?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  redirectTo?: string;
}

const LogoutButton = ({
  onClick,
  onConnect,
  onDisconnect,
  redirectTo,
}: IProps) => {
  const fetcher = useFetcher();
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

  return (
    <>
      <div>
        <button
          className={`group flex w-full items-center rounded-md px-2 py-2 text-sm`}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default LogoutButton;
