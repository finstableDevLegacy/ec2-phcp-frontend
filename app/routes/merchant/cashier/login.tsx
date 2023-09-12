import { useTranslation } from "react-i18next";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { loginMember } from "~/api/merchant/member.api";
import {
  createUserSession,
  getUserToken,
} from "~/utils/cashier-session.server";
import { AxiosError } from "axios";
import Loading from "~/components/loading";

type ActionData = {
  formError?: string;
};

export let handle = {
  i18n: ["login"],
};

const jsonResponse = (data: ActionData, statusCode: number = 400) =>
  json(data, { status: statusCode });

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserToken(request);
  if (user) {
    return redirect("/merchant/cashier");
  }
  return {};
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return jsonResponse({
      formError: `Form not submitted correctly.`,
    });
  }
  try {
    const data = await loginMember({ username: email, password });
    return createUserSession(data.access_token, redirectTo);
  } catch (err) {
    let error = err as AxiosError;
    return jsonResponse({
      formError: `Please check your email or password.`,
    });
  }
};

export default function CashierLogin() {
  const { t } = useTranslation("login");
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transition = useTransition();

  return (
    <div className="flex min-h-full w-full justify-center pt-5 pb-10 sm:pt-10">
      <div className="w-full max-w-xs">
        <Form
          method="post"
          className="wallet-pay mb-4 rounded bg-white px-8 pt-6 pb-8 shadow-md"
        >
          <p className="mt-5 flex justify-center text-xl font-bold text-primary-yellow">
            {t("login")}
          </p>
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? "/merchant/cashier"}
          />
          <div className="mb-4">
            <label className="mb-2 block text-sm text-white" htmlFor="username">
              {t("email")}
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none focus:ring-secondary-green-light"
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm text-white" htmlFor="password">
              {t("password")}
            </label>
            <input
              className="focus:shadow-outline mb-1 w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none focus:ring-secondary-green-light"
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
            />
            <p
              className="flex cursor-pointer justify-end text-xs text-white"
              onClick={() => navigate("/merchant/cashier/forgot-password")}
            >
              {t("forget_password")}
            </p>
          </div>
          <div className="mt-0 flex flex-col items-center justify-center">
            <button
              className="focus:shadow-outline w-full rounded-full border border-primary-yellow bg-primary-yellow py-2 px-4 font-bold text-white hover:bg-transparent hover:text-primary-yellow focus:outline-none"
              type="submit"
            >
              {transition.submission ? (
                <div className="flex items-center justify-center">
                  <Loading />
                  <p>{t("login")}...</p>
                </div>
              ) : (
                t("login")
              )}
            </button>
            {actionData?.formError ? (
              <div>
                <p className="mt-5 inline-block align-baseline text-sm text-red-500">
                  {actionData?.formError}
                </p>
              </div>
            ) : null}
          </div>
        </Form>
      </div>
    </div>
  );
}
