import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBankProfile } from "~/api/merchant/bankprofile";
import { LoadingBankProfile } from "~/components/loading-bank-profile";
import ModalBankDetail from "~/components/modalBankDetail";
import STORAGE_KEYS from "~/constants/storage-key";
import localService from "~/services/localstorage";
import { GetBankProfileResponse } from "~/type/bankprofile";

export default function ManagerBankDetail() {
  const { t } = useTranslation("manager");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingBankProfile, setIsFetchingBankProfile] = useState(true);
  const [bankProfile, setBankProfile] = useState<GetBankProfileResponse>({
    name: "Please add bank account name",
    bankAccountNumber: "Please add bank account number",
    bankName: "Please add bank name",
  });

  const callApiGetBankProfile = async () => {
    try {
      setIsFetchingBankProfile(true);
      const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const fetchedBankProfile = await getBankProfile(accessToken);
      setBankProfile(fetchedBankProfile);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingBankProfile(false);
    }
  };

  useEffect(() => {
    callApiGetBankProfile();
  }, []);

  const renderBody = () => {
    if (isFetchingBankProfile) {
      return (
        <div className="py-5">
          <div className="my-4 flex items-center justify-center text-center text-3xl font-bold text-primary-black">
            <label htmlFor="">Bank</label>
          </div>
          <div className="m-auto h-20 w-20">
            <LoadingBankProfile />
          </div>
        </div>
      );
    }
    return (
      <>
        {isModalOpen ? (
          <ModalBankDetail
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            data={{
              bankAccountNumber: bankProfile.bankAccountNumber,
              name: bankProfile.name,
              bankName: bankProfile.bankName,
            }}
            setData={setBankProfile}
          />
        ) : null}

        <div className="my-4 flex items-center justify-between text-center text-3xl font-bold text-primary-black">
          <div></div>
          <label htmlFor="" className="text-primary-yellow">
            Bank
          </label>
          <button
            className=""
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 fill-primary-yellow"
              viewBox="0 0 20 20"
              fill="d"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>

        {/*bank account number*/}
        <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border">
          <label className="absolute left-0 -top-8 font-semibold text-white">
            {t("bank_account_number")}
          </label>
          <div className="cursor-not-allowed px-3 text-white">
            {bankProfile.bankAccountNumber ? (
              <>{bankProfile.bankAccountNumber}</>
            ) : (
              <>{t("please_bank_account_number")}</>
            )}
          </div>
        </div>

        {/*bank account name*/}
        <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border">
          <label className="absolute left-0 -top-8 font-semibold text-white">
            {t("bank_account_name")}
          </label>
          <div className="cursor-not-allowed px-3 text-white">
            {bankProfile.name ? (
              <>{bankProfile.name}</>
            ) : (
              <>{t("please_bank_account_name")}</>
            )}
          </div>
        </div>

        {/*bank name*/}
        <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border">
          <label className="absolute left-0 -top-8 font-semibold text-white">
            {t("bank_name")}
          </label>
          <div className="cursor-not-allowed px-3 text-white">
            {bankProfile.bankName ? (
              <>{bankProfile.bankName}</>
            ) : (
              <>{t("please_bank_name")}</>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="flex items-center justify-center gap-10">
        <div className="wallet-pay my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          {renderBody()}
        </div>
      </div>
    </>
  );
}
