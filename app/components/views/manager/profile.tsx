import { useTranslation } from "react-i18next";
import { useManagerInfo } from "~/hooks/useManagerInfo";
import { truncateAddress } from "~/utils/format";
import { useState } from "react";
import ModalRegistermanager from "../../modalRegistermanager";
import { useAccount } from "wagmi";

export default function ManagerProfile() {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [{ data: accountData }] = useAccount();

  const { t } = useTranslation("manager");

  const { managerData } = useManagerInfo(accountData?.address as string);

  const handleClick = () => {
    setIsWalletOpen(true);
  };

  return (
    <div className="flex items-center justify-center gap-10">
      <div className="wallet-pay my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
        <div className="flex justify-between">
          <div></div>
          <div className="text-primary-yellow my-4 flex items-center justify-center text-center text-3xl font-bold">
            {t("profile")}
          </div>
          <div className="flex  items-center justify-center">
            <ModalRegistermanager
              redirectPath={""}
              isOpen={isWalletOpen}
              setIsOpen={setIsWalletOpen}
              managerData={managerData}
            />
            <button onClick={handleClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 fill-primary-yellow "
                viewBox="0 0 20 20"
                fill="d"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col rounded-xl p-2 px-4">
          {/*name */}
          <div className="relative mt-8 inline-flex h-12 w-full items-center  rounded border ">
            <label className="text-white absolute left-0 -top-8 font-semibold">
              {t("merchant_name")}
            </label>
            <div className="cursor-not-allowed px-3 text-white">
              {managerData?.name}
            </div>
          </div>

          <div></div>
          {/*address */}
          <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border ">
            <label className="text-white absolute left-0 -top-8 font-semibold">
              {t("department_address")}
            </label>
            <div className="cursor-not-allowed px-3 text-white">
              {managerData?.address}
            </div>
          </div>
          {/* first name */}
          <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border ">
            <label className="text-white absolute left-0 -top-8 font-semibold">
              {t("firstname")}
            </label>
            <div className="cursor-not-allowed px-3 text-white">
              {managerData?.firstName}
            </div>
          </div>
          {/* last name */}
          <div className="text-white relative mt-8 inline-flex h-12 w-full items-center rounded border ">
            <label className="absolute left-0 -top-8 font-semibold">
              {t("lastname")}
            </label>
            <div className="cursor-not-allowed px-3 text-white">
              {managerData?.lastName}
            </div>
          </div>
          {/* email name */}
          <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border ">
            <label className="text-white absolute left-0 -top-8 font-semibold">
              {t("email")}
            </label>
            <div className="cursor-not-allowed px-3 text-white">
              {managerData?.email}
            </div>
          </div>
          {/* phone number */}
          <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border ">
            <label className="text-white absolute left-0 -top-8 font-semibold">
              {t("phone_number")}
            </label>
            <div className="cursor-not-allowed px-3 text-white">
              {managerData?.phoneNumber}
            </div>
          </div>

          {/*wallet address*/}
          <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border ">
            <label className="text-white absolute left-0 -top-8 font-semibold">
              {t("wallet_address")}
            </label>
            <div className="cursor-not-allowed px-3  text-white">
              {truncateAddress(managerData?.walletAddress, 8)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
