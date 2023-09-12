import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import WithdrawPackageView from "~/components/views/manager/withdraw-package";
import { parseEncryptURL } from "~/utils/crypto";

type LoadData = {
  amount: string;
  symbol: string;
};

export let handle = {
  i18n: ["withdraw"],
};

export const loader: LoaderFunction = ({request}) => {
  const { parseURL } = parseEncryptURL(request.url);
  const hasSymbol = parseURL.searchParams.has("symbol");
  if (!hasSymbol) return redirect("/merchant/manager/wallet");

  const amount = parseURL.searchParams.get('amount');
  const symbol = parseURL.searchParams.get('symbol');
  return {
    amount,
    symbol
  }
}

export default function WithdrawPackage () {
  const { amount, symbol } = useLoaderData<LoadData>();
  return <WithdrawPackageView amount={amount} _symbol={symbol} />;
}