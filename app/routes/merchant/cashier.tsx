import { useEffect } from "react";
import { LoaderFunction } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { useAccount, useConnect } from "wagmi";
import CashierLayout from "~/components/layout/cashier-layout";
import { useManagerInfo } from "~/hooks/useManagerInfo";
import { getCashierUser, logoutCashier } from "~/utils/cashier-session.server";

export let handle = {
  i18n: ["cashier"],
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const data = await getCashierUser(request);
    return {
      cashierData: data?.user,
    };
  } catch (err) {
    return logoutCashier(request);
  }
};

export default function CashierPage() {
  const { cashierData } = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const [{ data: accountData }] = useAccount();
  const [{ error, loading }] = useConnect();
  const { managerData, isFetching, refetch } = useManagerInfo(
    accountData?.address!
  );

  const requiredLoginPath = ["/merchant/cashier"];
  const isRequired = requiredLoginPath.includes(location.pathname);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (error) {
      navigate("/merchant/cashier/login");
      return;
    }
    if (isFetching) {
      return;
    }
    if (isRequired && !cashierData && !managerData) {
      navigate("/merchant/cashier/login");
      return;
    }
  }, [loading, error, isFetching]);

  return (
    <CashierLayout cashierData={cashierData} managerData={managerData}>
      <Outlet />
    </CashierLayout>
  );
}
