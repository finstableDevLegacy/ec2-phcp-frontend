import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import localService from "~/services/localstorage";
import STORAGE_KEYS from "~/constants/storage-key";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Loading from "./loading";
import { useAccount } from "wagmi";
import { updateBankProfile } from "~/api/merchant/bankprofile";
import { GetBankProfileResponse } from "~/type/bankprofile";

const bankSchema = yup.object({
  bankAccountNumber: yup
    .string()
    .required("Please enter your bankAccountNumber"),
  name: yup.string().required("Please enter your name"),
  bankName: yup.string().required("Please enter your bankName"),
  // bankName: yup.string().required("Please enter your bankName"),
  // accountName: yup.string().required("Please enter your accountName"),
  // accountNumber: yup.string().required("Please enter your accountNumber"),
});

type PropsType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConnect?: () => void;
  data: GetBankProfileResponse;
  setData: React.Dispatch<React.SetStateAction<GetBankProfileResponse>>;
};

export default function ModalBankDetail({
  isOpen,
  setIsOpen,
  data,
  setData,
}: // bkNextAddress,
PropsType) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GetBankProfileResponse>({
    defaultValues: { ...data },
    resolver: yupResolver(bankSchema),
    // { ...managerData },
    // resolver: yupResolver(addMemberSchema),
  });
  const { t } = useTranslation("manager");
  const [loading, setLoading] = useState(false);
  const [{ data: accountData }, disconnect] = useAccount();
  const onHandleSubmit = async (form: GetBankProfileResponse) => {
    if (!loading) {
      setLoading(true);
      const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      try {
        await updateBankProfile(
          accessToken,
          form.bankAccountNumber,
          form.name,
          form.bankName
        );
        Swal.fire({
          title: "Edit profile success",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
        setData({
          bankAccountNumber: form.bankAccountNumber,
          name: form.name,
          bankName: form.bankName,
        });
        setIsOpen(false);
      } catch (err) {
        Swal.fire({
          title: "Please fill out your information completely.",
          icon: "warning",
          showConfirmButton: true,
          confirmButtonColor: "#3b82f6",
        });
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

          <div className="flex items-center justify-center gap-10">
            <div className="wallet-pay my-28 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-between">
                <div></div>
                <div></div>
                <div>
                  <button
                    className="text-red-400"
                    onClick={() => setIsOpen(false)}
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
                <div className="flex flex-col rounded-xl">
                  <div className="flex justify-between">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <div className="flex flex-col rounded-xl bg-primary-black-gray bg-white p-2">
                    {/*name */}
                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        bank address
                      </label>
                      <input
                        {...register("bankAccountNumber")}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={data?.bankAccountNumber}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.bankAccountNumber && (
                        <div className="text-xs text-red-600">
                          {errors.bankAccountNumber?.message}
                        </div>
                      )}
                    </div>

                    {/*address */}
                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        bank owner name
                      </label>
                      <input
                        {...register("name")}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={data?.name}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.name && (
                        <div className="text-xs text-red-600">
                          {errors.name?.message}
                        </div>
                      )}
                    </div>

                    {/*firstName */}
                    <div className="relative mt-8 inline-flex h-10 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 text-white">
                        bank name
                      </label>
                      <input
                        {...register("bankName")}
                        className="h-full w-full bg-[#f5f5f5] px-3"
                        placeholder={data?.bankName}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.bankName && (
                        <div className="text-xs text-red-600">
                          {errors.bankName?.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <button className="flex items-center justify-center rounded-md bg-primary-yellow py-2 px-3 font-bold text-white hover:to-blue-300">
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
