import { useTranslation } from "react-i18next";
import { useNavigate } from "@remix-run/react";
import MerchantLayout from "~/components/layout/merchant-layout";

export let handle = {
  i18n: ["merchant", "common"],
};

export default function SelectRolePage() {
  const { t } = useTranslation("merchant");
  const navigate = useNavigate();

  const nextRouteCashier = () => {
    navigate("/merchant/cashier");
  };

  const nextRouteManager = () => {
    navigate("/merchant/manager");
  };

  return (
    <MerchantLayout>
      <div className="flex items-center justify-center gap-10 pt-20">
        <div className="wallet-pay flex w-full flex-col space-y-3 rounded-md p-8 shadow-md md:max-w-md">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-7 py-10">
              <label
                htmlFor="choose your role"
                className="mb-5 flex items-center justify-center"
              >
                <span className="text-3xl font-bold text-primary-yellow">
                  {t("choose_your_role")}
                </span>
              </label>

              <button
                onClick={nextRouteCashier}
                type="submit"
                className="hover:bg-white-700 text-smfont-medium inline-flex w-full justify-center rounded-full border border-transparent bg-yellow-600 p-8 px-5 py-5 font-medium text-black shadow-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
              >
                <div className="flex flex-row space-x-5">
                  <div className="flex items-center justify-center text-xl font-bold text-white">
                    {t("cashier")}
                  </div>
                </div>
              </button>

              <button
                onClick={nextRouteManager}
                type="submit"
                className="hover:bg-white-700 text-smfont-medium inline-flex w-full justify-center rounded-full border border-transparent bg-primary-yellow p-8 px-5 py-5 font-medium text-black shadow-xl  hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2"
              >
                <div className="flex flex-row space-x-5">
                  <div className="flex items-center justify-center text-xl font-bold text-white">
                    {t("manager")}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
