import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { AxiosError } from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import {
  requestResetPasswordStatus,
  resetPassword,
} from "~/api/merchant/member.api";
import Swal from "sweetalert2";

type FieldErrors = {
  newPassword: string | null;
  confirmPassword: string | null;
};
type ActionData = {
  formError?: string;
  message?: string;
  fieldErrors?: FieldErrors;
  fields?: { newPassword: string; confirmPassword: string };
};

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    throw Error("Passwords must be at least 6 characters long");
  }
  if (!/[!@.$^*()-_]/.test(password)) {
    throw Error("Passwords must contain at least 1 special character");
  }
  return password;
}

const jsonResponse = (data: ActionData, statusCode: number = 400) =>
  json(data, { status: statusCode });

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const cft = url.searchParams.get("cft");

  const formData = await request.formData();
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    typeof cft !== "string"
  ) {
    return jsonResponse({
      formError: `Form not submitted correctly.`,
    });
  }

  const fieldErrors: FieldErrors = {
    newPassword: null,
    confirmPassword: null,
  };

  if (!newPassword) {
    fieldErrors.newPassword = "Password is required";
  } else {
    try {
      validatePassword(newPassword);
    } catch (e) {
      if (e instanceof Error) {
        fieldErrors.newPassword = e.message;
      } else if (typeof e === "string") {
        fieldErrors.newPassword = e;
      } else {
        fieldErrors.newPassword = "There was an error with this field";
      }
    }
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Confirm Password is required";
  } else {
    try {
      validatePassword(confirmPassword);
    } catch (e) {
      if (e instanceof Error) {
        fieldErrors.confirmPassword = e.message;
      } else if (typeof e === "string") {
        fieldErrors.confirmPassword = e;
      } else {
        fieldErrors.confirmPassword = "There was an error with this field";
      }
    }
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return jsonResponse({ fieldErrors });
  }

  try {
    const status = await requestResetPasswordStatus(cft);
    await resetPassword({
      id: status.member_id,
      newPassword,
      confirmPassword,
    });
    Swal.fire({
      title: "Reset Password Success",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
    });
    return redirect("/merchant/cashier/login");
  } catch (err) {
    let error = err as AxiosError;
    if (error?.response!.status === 400) {
      return jsonResponse({
        formError: `Confirm password not match!`,
      });
    }
  }
};

export default function ResetPassword() {
  const { t } = useTranslation("cashier");
  const [searchParam] = useSearchParams();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const cft = searchParam.get("cft");

  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  return (
    <div className="flex min-h-full w-full justify-center pt-5 pb-10 sm:pt-10">
      <div className="w-full max-w-xs">
        <Form
          method="post"
          action={"?cft=" + cft}
          className="wallet-pay mb-4 rounded bg-white px-8 pt-6 pb-8 shadow-md"
        >
          <p className="mt-5 mb-4 flex justify-start text-xl font-bold text-primary-yellow">
            {t("set_your_password")}
          </p>
          <div className="mb-4">
            <label
              className="mb-2 block text-sm text-white"
              htmlFor="newPassword"
            >
              {t("password")}
            </label>
            <div className="relative">
              <input
                className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 pr-8 leading-tight text-gray-700 shadow focus:outline-none"
                id="newPassword"
                name="newPassword"
                type={showPassword.newPassword ? "text" : "password"}
                placeholder="Password"
              />
              <div
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    newPassword: !prev.newPassword,
                  }))
                }
              >
                {showPassword.newPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </div>
            </div>
            {actionData?.fieldErrors?.newPassword ? (
              <p className="inline-block align-baseline text-sm text-red-500">
                {actionData.fieldErrors.newPassword}
              </p>
            ) : null}
          </div>

          <div className="">
            <label
              className="mb-2 block text-sm text-white"
              htmlFor="confirmPassword"
            >
              {t("confirm_password")}
            </label>
            <div className="relative">
              <input
                className="focus:shadow-outline mb-1 w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword.confirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
              />
              <div
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    confirmPassword: !prev.confirmPassword,
                  }))
                }
              >
                {showPassword.confirmPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </div>
            </div>
            {actionData?.fieldErrors?.confirmPassword ? (
              <p className="inline-block align-baseline text-sm text-red-500">
                {actionData.fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          {actionData?.formError ? (
            <p className="inline-block align-baseline text-sm text-red-500">
              {actionData?.formError}
            </p>
          ) : null}

          <div className="mt-3 flex flex-col items-center justify-center">
            <button
              className="focus:shadow-outline rounded-lg bg-primary-yellow py-2 px-4 font-bold text-white focus:outline-none"
              type="submit"
            >
              {transition.submission ? `${t("submit")}...` : t("submit")}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
