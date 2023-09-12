import { LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Chain } from "wagmi";

import PayLayout from "~/components/layout/pay-layout";
import { getChains } from "~/config/network";

export type PayLoaderData = {
  chains: Chain[];
};

export let handle = {
  i18n: ["common"],
};

export const loader: LoaderFunction = async ({ request }) => {
  const { chains } = getChains(process.env.ENV);
  return {
    chains,
  };
};

export default function PayPage() {
  return (
    <PayLayout>
      <Outlet />
    </PayLayout>
  );
}
