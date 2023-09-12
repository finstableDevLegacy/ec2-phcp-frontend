import SettingPaymentOption from "~/components/settingPaymentOption";
import ManagerBankDetail from "~/components/views/manager/bank-detail";
import ManagerProfile from "~/components/views/manager/profile";
import { useTranslation } from "react-i18next";

export default function ManagerPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full">
        <ManagerProfile />
        <ManagerBankDetail />
        {/* <SettingPaymentOption /> */}
      </div>
    </div>
  );
}
