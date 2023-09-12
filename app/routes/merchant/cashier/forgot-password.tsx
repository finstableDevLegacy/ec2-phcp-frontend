import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { ActionFunction, json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { requestResetPassword } from "~/api/merchant/member.api";

type ActionData = {
  formError?: string;
  message?: string;
};

const jsonResponse = (data: ActionData, statusCode: number = 400) =>
  json(data, { status: statusCode });

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const email = formData.get("email");

  if (typeof email !== "string" || !email) {
    return jsonResponse({
      formError: `Form not submitted correctly.`,
    });
  }

  try {
    await requestResetPassword(email, "phc");
    return jsonResponse({ message: "Reset password was sent to your email" });
    // return redirect("/merchant/cashier/login");
  } catch (err) {
    let error = err as AxiosError;
    if (error?.response!.status === 404) {
      return jsonResponse({
        formError: `Please check your email`,
      });
    }
    return jsonResponse({
      formError: `Something went wrong`,
    });
  }
};

const CashierForgotPassword = () => {
  const { t } = useTranslation("cashier");
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  return (
    <div className="flex min-h-full w-full justify-center pt-5 pb-10 sm:pt-10">
      <div className="w-full max-w-xs">
        <Form
          method="post"
          className="wallet-pay mb-4 rounded bg-white px-8 pt-6 pb-8 shadow-md"
        >
          <p className="mt-5 mb-4 flex justify-start text-xl font-bold text-primary-yellow">
            {t("reset_password")}
          </p>
          <div className="mb-4">
            <label
              className="mb-2 block text-sm text-white"
              htmlFor="oldPassword"
            >
              {t("email")}
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
              id="email"
              name="email"
              type="email"
              placeholder="Email"
            />
          </div>

          {actionData?.message ? (
            <div>
              <p className="inline-block align-baseline text-sm text-green-500">
                {actionData?.message}
              </p>
            </div>
          ) : (
            <div className="mt-0 flex flex-col items-center justify-center">
              <button
                className="focus:shadow-outline rounded-full border border-primary-yellow bg-primary-yellow py-2 px-4 text-sm font-bold text-white hover:bg-transparent hover:text-primary-yellow focus:outline-none"
                type="submit"
              >
                {transition.submission ? `${t("submit")}...` : t("submit")}
              </button>
            </div>
          )}

          {actionData?.formError ? (
            <p className="mt-5 inline-block align-baseline text-sm text-red-500">
              {actionData?.formError}
            </p>
          ) : null}
        </Form>
      </div>
    </div>
  );
};

export default CashierForgotPassword;
