import { Outlet } from "@remix-run/react";
import { useManagerInfo } from "~/hooks/useManagerInfo";
import ManagerLayout from "~/components/layout/manager-layout";
import ManagerConnectWallet from "~/components/views/manager/connect-wallet";
import ManagerRegister from "~/components/views/manager/register";
import { useAccount } from "wagmi";
import useAuthStore from "~/stores/auth-store";

export let handle = {
  i18n: ["manager", "common"],
};

export default function ManagerPage() {
  const [{ data: accountData }] = useAccount();
  const { managerData } = useManagerInfo(accountData?.address as string);
  const accessToken = useAuthStore((state) => state.managerAccessToken);

  const renderContent = () => {
    if (accessToken && accountData?.address && managerData) {
      return <Outlet />;
    } else if (accessToken && accountData?.address && !managerData) {
      return <ManagerRegister />;
    } else {
      return <ManagerConnectWallet />;
    }
  };

  return <ManagerLayout>{renderContent()}</ManagerLayout>;
}
