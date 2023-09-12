import { createCookieSessionStorage, redirect } from "@remix-run/node";
import "dotenv/config";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "PM_session",
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
  session.set("token", token);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function createDealerUserSession(
  token: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("dealer_token", token);
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
  const user = session.get("token");

  const isExpired = isTokenExpired(user);

  if (isExpired) {
    throw logout(request);
  }

  if (!user || typeof user !== "string") return null;
  return user;
}

export async function getDealerUserToken(request: Request) {
  const session = await getUserSession(request);
  const user = session.get("dealer_token");

  const isExpired = isTokenExpired(user);

  if (isExpired) {
    throw logout(request, "/dealer/login");
  }

  if (!user || typeof user !== "string") return null;
  return user;
}

export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const user = await getUserToken(request);

  if (!user || typeof user !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  return user;
}

export async function logout(request: Request, redirectTo = "/") {
  const session = await storage.getSession(request.headers.get("Cookie"));
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
