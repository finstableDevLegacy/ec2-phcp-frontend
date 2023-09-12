import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logoutCashier } from "~/utils/cashier-session.server";

export const action: ActionFunction = async ({ request }) => {
  return logoutCashier(request!);
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");

  if (redirectTo) {
    return redirect(redirectTo);
  } else {
    return redirect("/merchant/cashier");
  }
};
