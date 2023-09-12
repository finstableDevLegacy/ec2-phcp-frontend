import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as yup from "yup";
import { createMemberManager } from "~/api/merchant/member.api";
import { MemberMerchantRegister } from "~/type/member";
import localService from "~/services/localstorage";
import STORAGE_KEYS from "~/constants/storage-key";
import Loading from "~/components/loading";
import { useTranslation } from "react-i18next";
import { CreateDealerUser } from "~/type/dealer/create-dealer-user.type";
import { createDealerUser } from "~/api/dealer/create-dealer.api";

const addMemberSchema = yup.object({
  name: yup.string().required("Please enter your merchant name"),
  address: yup.string().required("Please enter your department address"),
  firstName: yup.string().required("Please enter your first name"),
  lastName: yup.string().required("Please enter your last name"),
  email: yup.string().required("Please enter your email"),
  phoneNumber: yup.string().required("Please enter your phone number"),
});

export default function registerManager() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberMerchantRegister>({
    resolver: yupResolver(addMemberSchema),
  });

  const { t } = useTranslation("manager");
  const [loading, setLoading] = useState(false);
  const [checkPolicy, setCheckPolicy] = useState(false);
  const listInnerRef = useRef(null);
  const [scrollToBottom, setScrollToBottom] = useState(false);

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      if (scrollTop + clientHeight === scrollHeight) {
        setScrollToBottom(true);
      }
    }
  };

  const onHandleSubmit = async (form: MemberMerchantRegister) => {
    if (!loading) {
      setLoading(true);
      const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const payload = Object.assign(form);

      try {
        const response = await createMemberManager(
          accessToken as string,
          payload,
          "phc",
          "createMember",
          payload.name,
          payload.address
        );
        const payloadToCreateDealer: CreateDealerUser = {
          address: response.data.walletAddress,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phoneNumber: response.data.phoneNumber,
          email: response.data.email,
        };
        await createDealerUser(payloadToCreateDealer);
        if (response.data) {
          Swal.fire({
            title: t("create_member_success"),
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          await new Promise((resolve) => setTimeout(resolve, 2000));
          window.location.reload();
          return;
        } else {
          Swal.fire({
            title: t("please_fill_out"),
            icon: "warning",
            showConfirmButton: true,
            confirmButtonColor: "#3b82f6",
          });
        }
      } catch (e: any) {
        Swal.fire({
          title: e.response.data.message,
          icon: "error",
          showConfirmButton: true,
          confirmButtonColor: "#3b82f6",
        });
      }
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e: any) => {
    setCheckPolicy(e.target.checked);
  };

  return (
    <form
      className="flex items-center justify-center gap-10 py-10"
      onSubmit={handleSubmit(onHandleSubmit)}
    >
      <div className="wallet-pay my-1 inline-block w-full max-w-lg transform rounded-2xl border border-primary-black-gray bg-white p-6 text-left align-middle shadow-xl transition-all">
        <div className="my-4 text-center text-3xl font-bold text-primary-yellow">
          {t("register")}
        </div>
        <div className="flex flex-col rounded-xl bg-primary-black-gray p-8 pb-0 pb-4">
          {/*name */}
          <div className="relative mt-1 inline-flex w-full items-center rounded border">
            <label className="absolute left-0 -top-8 font-medium text-white">
              {t("merchant_name")}
            </label>
            <input
              className="w-full  rounded border border-primary-yellow bg-inherit py-3 px-2 text-sm text-white"
              placeholder="Please enter your merchant name"
              {...register("name")}
            ></input>
          </div>
          <div className="mt-2 w-full">
            {errors.name && (
              <div className="text-xs text-red-600">{errors.name?.message}</div>
            )}
          </div>
          {/*address */}
          <div className="relative mt-10 inline-flex w-full items-center rounded border">
            <label className="absolute left-0 -top-8 font-medium text-white">
              {t("department_address")}
            </label>
            <input
              className="w-full rounded border border-primary-yellow bg-inherit py-3 px-2 text-sm text-white outline-none focus:border-primary-yellow"
              placeholder="Please enter your department address"
              {...register("address")}
            ></input>
          </div>
          <div className="mt-2 w-full">
            {errors.address && (
              <div className="text-xs text-red-600">
                {errors.address?.message}
              </div>
            )}
          </div>
          {/* first name */}
          <div className="relative mt-10 inline-flex w-full items-center rounded border ">
            <label className="absolute left-0 -top-8 font-medium text-white">
              {t("first_name")}
            </label>
            <input
              className="w-full rounded border border-primary-yellow bg-inherit py-3 px-2 text-sm text-white outline-none focus:border-primary-yellow"
              placeholder="Please enter your first name"
              {...register("firstName")}
            ></input>
          </div>
          <div className="mt-2 w-full">
            {errors.firstName && (
              <div className="text-xs text-red-600">
                {errors.firstName?.message}
              </div>
            )}
          </div>
          {/* last name */}
          <div className="relative mt-10 inline-flex w-full items-center rounded border ">
            <label className="absolute left-0 -top-8 font-medium text-white">
              {t("last_name")}
            </label>
            <input
              className="w-full rounded border border-primary-yellow bg-inherit py-3 px-2 text-sm text-white outline-none focus:border-primary-yellow"
              placeholder="Please enter your last name"
              {...register("lastName")}
            ></input>
          </div>
          <div className="mt-2 w-full">
            {errors.lastName && (
              <div className="text-xs text-red-600">
                {errors.lastName?.message}
              </div>
            )}
          </div>
          {/* email name */}
          <div className="relative mt-10 inline-flex w-full items-center rounded border ">
            <label className="absolute left-0 -top-8 font-medium text-white">
              {t("email")}
            </label>
            <input
              className="w-full rounded border border-primary-yellow bg-inherit py-3 px-2 text-sm text-white outline-none focus:border-primary-yellow"
              placeholder="Please enter your email"
              type="email"
              {...register("email")}
            ></input>
          </div>
          <div className="mt-2 w-full">
            {errors.email && (
              <div className="text-xs text-red-600">
                {errors.email?.message}
              </div>
            )}
          </div>
          {/* first name */}
          <div className="relative mt-10 inline-flex w-full items-center rounded border">
            <label className="absolute left-0 -top-8 font-medium text-white">
              {t("phone_number")}
            </label>
            <input
              className="w-full rounded border border-primary-yellow bg-inherit py-3 px-2 text-sm text-white outline-none focus:border-primary-yellow"
              placeholder="Please enter your phone number"
              maxLength={10}
              {...register("phoneNumber")}
            ></input>
          </div>
          <div className="h-4 w-full">
            {errors.phoneNumber && (
              <div className="text-xs text-red-600">
                {errors.phoneNumber?.message}
              </div>
            )}
          </div>
          <div>
            <div className="relative  mt-5 inline-flex w-full items-center justify-center">
              <div className="relative flex items-center justify-center py-5">
                <div className="w-32 flex-grow border-t border-gray-400"></div>
                <span className="p-5 text-center text-sm font-bold text-primary-yellow">
                  {t("policy.header")}
                </span>
                <div className="w-32 flex-grow border-t border-gray-400"></div>
              </div>
            </div>
            <div
              ref={listInnerRef}
              className="policy h-60 overflow-y-scroll md:w-[26.8rem]"
              onScroll={() => onScroll()}
            >
              <p className="pr-4 font-light text-white">
                {t("term_policy.1.content.1")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.1.content.2")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.1.content.3")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.1.content.4")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.2.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.2.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.3.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.3.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.4.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.4.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.5.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.5.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.6.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.6.content.1")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.6.content.2")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.7.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.7.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.8.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.8.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.9.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.9.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.10.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.10.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.11.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.11.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.12.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.12.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.13.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.13.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.14.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.14.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.15.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.15.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.16.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.16.content.1")}
              </p>
              <br />
              <p className="pr-4 font-light text-white">
                {t("term_policy.17.topic")}
              </p>
              <p className="pr-4 font-light text-white">
                {t("term_policy.17.content.1")}
              </p>
              <br />
              <div className="mt-5 mb-5 ml-1 flex flex-col items-start">
                <div className="flex">
                  <input
                    checked={checkPolicy}
                    id="checked-checkbox"
                    value=""
                    type="checkbox"
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded-full border-white bg-[#EFBD3C] ring-white hover:border-white hover:bg-[#EFBD3C] focus:bg-[#EFBD3C] focus:ring-white"
                  />
                  <label
                    htmlFor="checked-checkbox"
                    className="ml-2 text-sm font-light text-white"
                  >
                    {t("policy.accept.1")}
                  </label>
                </div>
                <div className="ml-6 text-sm font-light text-white">
                  {t("policy.accept.2")}
                </div>
                <div className="ml-6 text-sm font-light text-white">
                  {t("policy.accept.3")}
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          className={`my-2 flex w-full items-center justify-center rounded-full ${
            checkPolicy
              ? "bg-primary-yellow"
              : "pointer-events-none bg-gray-400"
          } py-3 text-white`}
          type="submit"
        >
          {loading ? <Loading /> : t("register")}
        </button>
      </div>
    </form>
  );
}
