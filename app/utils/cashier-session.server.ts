import { createCookieSessionStorage, redirect } from "@remix-run/node";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { getMemberByID } from "~/api/merchant/member.api";
import { getManagerDataById } from "~/api/merchant/manager";
import { MemberDetail } from "~/type/member";

const sessionSecret = process.env.SESSION_SECRET;
const sessionKey = "cashier_token";
const baseRedirect = "/merchant/cashier";

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "transcrypt_cashier",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(token: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set(sessionKey, token);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserToken(request: Request) {
  const session = await getUserSession(request);
  const userToken = session.get(sessionKey);
  if (!userToken || typeof userToken !== "string") return null;
  return userToken;
}

export async function getCashierUser(request: Request) {
  const userToken = await getUserToken(request);
  if (typeof userToken !== "string") {
    return null;
  }
  try {
    const isExpired = isTokenExpired(userToken);
    const decoded = jwt.decode(userToken);
    const user = await getMemberByID(decoded?.sub as string);
    const manager = await getManagerDataById(user.managerId);
    const userData = { ...user, managerData: manager } as MemberDetail;

    return { user: userData, isExpired };
  } catch {
    throw logoutCashier(request);
  }
}

export async function requireCashierUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const user = await getCashierUser(request);

  const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
  const redirectPath = `${baseRedirect}/login?${searchParams}`;
  if (!user) {
    throw redirect(redirectPath);
  }
  if (user.isExpired) {
    return logoutCashier(request, redirectPath);
  }

  return user;
}

export async function logoutCashier(
  request: Request,
  redirectTo = `${baseRedirect}/login`
) {
  const session = await getUserSession(request);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export const isTokenExpired = (token: string) => {
  if (!token) return false;

  const payloadBase64 = token.split(".")[1];
  const decodedJson = Buffer.from(payloadBase64, "base64").toString();
  const decoded = JSON.parse(decodedJson);
  const exp = decoded.exp;
  const expired = Date.now() >= exp * 1000;
  return expired;
};
