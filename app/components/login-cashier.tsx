import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { emailRegEx } from "../utils/format";

type PropsType = {
  title: string;
  path: string;
  //   isOpen: boolean;
  //   setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  //   onConnect?: () => void;
};

const LoginCardCashier = ({ title, path }: PropsType) => {
  const { t } = useTranslation("login");
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full max-w-xs">
        <form className="mb-4 rounded bg-white px-8 pt-6 pb-8 shadow-md">
          <p className="mt-5 flex justify-center text-xl  font-bold text-blue-600">
            {title}
          </p>
          <div className="mb-4">
            <label
              className="mb-2 block text-sm text-gray-600"
              htmlFor="username"
            >
              Email
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
              id="email"
              type="text"
              placeholder="Email"
              pattern={emailRegEx}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="mb-2 block text-sm text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="focus:shadow-outline mb-1 w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
              id="password"
              type="password"
              placeholder="Password"
              required
            />
            <p
              className="flex cursor-pointer  justify-end text-xs text-gray-900"
              onClick={() => navigate(path)}
            >
              Forget Password ?
            </p>
          </div>
          <div className="mt-0 flex flex-col items-center justify-center">
            <button
              className="focus:shadow-outline w-full rounded-lg bg-blue-700 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
              type="submit"
            >
              Log In
            </button>
            <a
              className="mt-5 inline-block align-baseline text-sm text-red-500"
              href="#"
            >
              Please check your email or password.
            </a>
          </div>
        </form>
      </div>
    </>
  );
};
export default LoginCardCashier;
