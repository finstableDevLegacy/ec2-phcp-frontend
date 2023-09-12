import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { truncateAddress } from "~/utils/format";
import { MemberMerchantRegister } from "~/type/member";
import { updateMemberManagerByID } from "~/api/merchant/member.api";
import Swal from "sweetalert2";
import localService from "~/services/localstorage";
import STORAGE_KEYS from "~/constants/storage-key";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Loading from "./loading";
import { useManagerInfo } from "~/hooks/useManagerInfo";
import { useAccount } from "wagmi";

const addMemberSchema = yup.object({
  name: yup.string().required("Please enter your name"),
  address: yup.string().required("Please enter your address"),
  firstName: yup.string().required("Please enter your firstname"),
  lastName: yup.string().required("Please enter your lastname"),
  email: yup.string().required("Please enter your email"),
  phoneNumber: yup.string().required("Please enter your phone number"),
  // bankName: yup.string().required("Please enter your bankName"),
  // accountName: yup.string().required("Please enter your accountName"),
  // accountNumber: yup.string().required("Please enter your accountNumber"),
});

type PropsType = {
  redirectPath: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConnect?: () => void;
  managerData: any;
};

export default function RegmenagerModal({
  isOpen,
  setIsOpen,
  managerData,
}: // bkNextAddress,
PropsType) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberMerchantRegister>({
    defaultValues: { ...managerData, ...managerData.bankAccount },
    resolver: yupResolver(addMemberSchema),
    // { ...managerData },
    // resolver: yupResolver(addMemberSchema),
  });
  const { t } = useTranslation("manager");
  const [loading, setLoading] = useState(false);
  const [isErrorPhoneNumber, setIsErrorPhoneNumber] = useState("");
  const [isErrorEmail, setIsErrorEmail] = useState("");
  const [{ data: accountData }, disconnect] = useAccount();
  const { refetch } = useManagerInfo(accountData?.address as string);
  const onHandleSubmit = async (form: MemberMerchantRegister) => {
    if (!loading) {
      setLoading(true);
      setIsErrorEmail("");
      setIsErrorPhoneNumber("");
      const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const walletBitkub = { bknAddress: accountData?.address as string };
      const payload = Object.assign(form, walletBitkub);
      try {
        const response = await updateMemberManagerByID(
          accessToken,
          payload,
          managerData.id,
          managerData.bankAccountId
        );
        if (response.data) {
          Swal.fire({
            title: "Edit profile success",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            title: "Please fill out your information completely.",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonColor: "#3b82f6",
          });
        }
        refetch();
        setIsOpen(false);
      } catch (error: any) {
        if (
          error.response.data.message instanceof Array &&
          error.response.data.message.length > 1
        ) {
          setIsErrorPhoneNumber(error.response.data.message[0]);
          setIsErrorEmail(error.response.data.message[1]);
        }
        const errorPhoneNumber =
          error.response.data.message[0].includes("phoneNumber");
        const errorEmail = error.response.data.message[0].includes("email");
        const duplicatePhoneNumber = error.response.data.message.includes(
          "Duplicate Phone Number"
        );
        const duplicateEmail =
          error.response.data.message.includes("Duplicate Email");
        if (errorPhoneNumber) {
          setIsErrorPhoneNumber("Invalid Phone number");
        } else if (errorEmail) {
          setIsErrorEmail(error.response.data.message[0]);
        } else if (duplicatePhoneNumber) {
          setIsErrorPhoneNumber(error.response.data.message);
        } else if (duplicateEmail) {
          setIsErrorEmail(error.response.data.message);
        } else {
          Swal.fire({
            title: error.response.data.message,
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: "#3b82f6",
          });
        }
      }
      setLoading(false);
    }
  };
  return (
    <div>
      <Transition appear show={isOpen}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            // leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-700 opacity-40" />
          </Transition.Child>

          <div className="flex items-center justify-center gap-10 ">
            <div className="wallet-pay my-28  w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-between">
                <div></div>
                <div></div>
                <div>
                  <button
                    className="text-red-400"
                    onClick={() => {
                      setIsOpen(false);
                      setIsErrorEmail("");
                      setIsErrorPhoneNumber("");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <form className="" onSubmit={handleSubmit(onHandleSubmit)}>
                <div className="flex flex-col rounded-xl ">
                  <div className="... flex justify-between">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <div className="flex flex-col rounded-xl bg-primary-black-gray bg-white p-2">
                    {/*name */}
                    <div className="relative mt-8 inline-flex  h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        {t("merchant_name")}
                      </label>
                      <input
                        {...register("name")}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={managerData?.name}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.name && (
                        <div className="text-xs text-red-600">
                          {errors.name?.message}
                        </div>
                      )}
                    </div>

                    {/*address */}
                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white ">
                        {t("department_address")}
                      </label>
                      <input
                        {...register("address")}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={managerData?.address}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.address && (
                        <div className="text-xs text-red-600">
                          {errors.address?.message}
                        </div>
                      )}
                    </div>

                    {/*firstName */}
                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        {t("firstname")}
                      </label>
                      <input
                        {...register("firstName")}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={managerData?.firstName}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.firstName && (
                        <div className="text-xs text-red-600">
                          {errors.firstName?.message}
                        </div>
                      )}
                    </div>

                    {/*lastName */}
                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        {t("lastname")}
                      </label>
                      <input
                        {...register("lastName")}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={managerData?.lastName}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.lastName && (
                        <div className="text-xs text-red-600">
                          {errors.lastName?.message}
                        </div>
                      )}
                    </div>

                    {/*email */}
                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        {t("email")}
                      </label>
                      <input
                        {...register("email")}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={managerData?.email}
                        onChange={() => {
                          setIsErrorEmail("");
                        }}
                      ></input>
                    </div>
                    {isErrorEmail && (
                      <div className="h-4 w-full">
                        <div className="text-xs text-red-600">
                          {isErrorEmail}
                        </div>
                      </div>
                    )}
                    {errors.email && (
                      <div className="h-4 w-full">
                        <div className="text-xs text-red-600">
                          {errors.email?.message}
                        </div>
                      </div>
                    )}

                    {/*phoneNumber */}
                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        {t("phone_number")}
                      </label>
                      <input
                        {...register("phoneNumber")}
                        maxLength={10}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={managerData?.phoneNumber}
                        onChange={() => {
                          setIsErrorPhoneNumber("");
                        }}
                      ></input>
                    </div>
                    {isErrorPhoneNumber && (
                      <div className="h-4 w-full">
                        <div className="text-xs text-red-600">
                          {isErrorPhoneNumber}
                        </div>
                      </div>
                    )}
                    {errors.phoneNumber && (
                      <div className="h-4 w-full">
                        <div className="text-xs text-red-600">
                          {errors.phoneNumber?.message}
                        </div>
                      </div>
                    )}

                    {/* <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8">
                        {t("bank_name")}
                      </label>
                      <input
                        {...register("bankName")}
                        className="w-full h-full bg-[#f5f5f5] px-3"
                        // placeholder={managerData?.bankAccount.bankName}>
                      ></input>
                    </div>

                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8">
                        {t("bank_account_name")}
                      </label>
                      <input
                        {...register("accountName")}
                        className="w-full h-full bg-[#f5f5f5] px-3"
                        // placeholder={managerData?.bankAccount.accountName}
                      ></input>
                    </div>

                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8">
                        {t("bank_account_number")}
                      </label>
                      <input
                        {...register("accountNumber")}
                        className="w-full h-full bg-[#f5f5f5] px-3"
                        // placeholder={managerData?.bankAccount.accountNumber}
                      ></input>
                    </div> */}

                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        {t("wallet_address")}
                      </label>
                      <div className="w-full cursor-not-allowed px-3 text-gray-400 ">
                        {truncateAddress(managerData?.walletAddress, 8)}
                      </div>
                    </div>

                    {/* <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5] ">
                      <label className="absolute left-0 -top-8">
                        {t("accept_fiat")}
                      </label>
                      <div className="w-full cursor-not-allowed px-3 text-gray-400 ">
                        {t("yes")}
                      </div>
                    </div> */}
                  </div>
                  <div className="mt-4  flex items-center justify-center">
                    <button className=" flex items-center justify-center  rounded-md bg-primary-yellow py-2 px-3 font-bold text-white  hover:to-blue-300">
                      {loading ? <Loading /> : "Submit"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
