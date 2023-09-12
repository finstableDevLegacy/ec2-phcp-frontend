import { useEffect } from "react";
import { LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { useAccount } from "wagmi";
import CashierLayout from "~/components/layout/cashier-layout";
import STORAGE_KEYS from "~/constants/storage-key";
import { useManagerInfo } from "~/hooks/useManagerInfo";
import localService from "~/services/localstorage";
import { getCashierUser } from "~/utils/cashier-session.server";

export let handle = {
  i18n: ["cashier"],
};

export const loader: LoaderFunction = async ({ request }) => {
  const data = await getCashierUser(request);
  return {
    cashierData: data?.user,
  };
};

export default function OrderPage() {
  const { cashierData } = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const [{ data: accountData }] = useAccount();

  const { managerData } = useManagerInfo(accountData?.address!);

  const requiredLoginPath = ["/merchant/order"];
  const isRequired = requiredLoginPath.includes(location.pathname);

  const token = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN) as string;

  useEffect(() => {
    if (isRequired && !cashierData && !managerData && !token) {
      navigate("/merchant/cashier/login?redirectTo=/merchant/order");
    }
  }, []);

  return (
    <CashierLayout cashierData={cashierData} managerData={managerData}>
      <Outlet />
    </CashierLayout>
  );
}
