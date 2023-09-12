import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");

  return logout(request, redirectTo!);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  if (redirectTo) {
    if (redirectTo === "/dealer/login") {
      return logout(request, redirectTo);
    }
    return redirect(redirectTo);
  } else {
    return redirect("/");
  }
};
