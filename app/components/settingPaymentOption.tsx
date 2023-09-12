import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import {
  getPayment,
  getPaymentByManager,
  updatePayment,
} from "~/api/merchant/manager";
import { parseReturnString, PAYMENT_OUTPUT } from "~/constants/paymentOptions";
import STORAGE_KEYS from "~/constants/storage-key";
import localService from "~/services/localstorage";
import { PaymentOption } from "~/type/manager";
import Loading from "./loading";

export default function SettingPaymentOption() {
  const { t } = useTranslation("manager");
  const [isPaymentList, setPaymentList] = useState<PaymentOption[]>([]);
  const [isChange, setChange] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, getValues, control, setValue } = useForm<{
    Token: boolean;
    Fiat: boolean;
    defaultValue: string;
  }>({
    mode: "onChange",
  });

  const showDefaultOption = () => {
    const token = useWatch({
      control,
      name: parseReturnString(PAYMENT_OUTPUT.TOKEN),
    });

    const fiat = useWatch({
      control,
      name: parseReturnString(PAYMENT_OUTPUT.FIAT),
    });
    if (token && fiat) {
      return (
        <>
          <div className="my-3">
            <label htmlFor="" className="font-semibold text-white">
              {t("default_payment_option")}
            </label>
            <select
              {...register("defaultValue")}
              className="mt-3 h-full w-full rounded border bg-[#f5f5f5] px-3"
            >
              <option value={parseReturnString(PAYMENT_OUTPUT.TOKEN)}>
                {t("token")}
              </option>
              <option value={parseReturnString(PAYMENT_OUTPUT.FIAT)}>
                {t("fiat")}
              </option>
            </select>
          </div>
        </>
      );
    }
  };

  const onHandleSubmit = async (form: {
    Token: boolean;
    Fiat: boolean;
    defaultValue: string;
  }) => {
    if (!loading) {
      setLoading(true);
      const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      try {
        const getPaymentValues = getValues([
          parseReturnString(PAYMENT_OUTPUT.TOKEN),
          parseReturnString(PAYMENT_OUTPUT.FIAT),
        ]);

        const optionToApi: string[] = [];
        let isDefaultOption: string = "";
        const isToken = isPaymentList.find(
          (option) => option.name === parseReturnString(PAYMENT_OUTPUT.TOKEN)
        );
        const isFiat = isPaymentList.find(
          (option) => option.name === parseReturnString(PAYMENT_OUTPUT.FIAT)
        );

        if (form.Token && isToken) {
          optionToApi.push(isToken.id);
          isDefaultOption = isToken?.id;
        }
        if (form.Fiat && isFiat) {
          optionToApi.push(isFiat.id);
          isDefaultOption = isFiat?.id;
        }

        if (form.Token && form.Fiat) {
          if (
            form.defaultValue === parseReturnString(PAYMENT_OUTPUT.TOKEN) &&
            isToken
          ) {
            isDefaultOption = isToken?.id;
          } else if (
            form.defaultValue === parseReturnString(PAYMENT_OUTPUT.TOKEN) &&
            isFiat
          ) {
            isDefaultOption = isFiat?.id;
          }
        }

        const response = await updatePayment(
          accessToken,
          isDefaultOption,
          optionToApi
        );

        if (response) {
          Swal.fire({
            title: t("edit_payment_option_success"),
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            title: t("please_try_again_later"),
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: "#3b82f6",
          });
        }
        setLoading(false);
      } catch (error) {
        Swal.fire({
          title: t("please_try_again_later"),
          icon: "error",
          showConfirmButton: true,
          confirmButtonColor: "#3b82f6",
        });
        getMyPayment()
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    }
  };

  useEffect(() => {
    if (
      !getValues(parseReturnString(PAYMENT_OUTPUT.TOKEN)) &&
      !getValues(parseReturnString(PAYMENT_OUTPUT.FIAT))
    ) {
      setChange(true);
    } else {
      setChange(false);
    }
  }, [
    getValues(parseReturnString(PAYMENT_OUTPUT.TOKEN)),
    getValues(parseReturnString(PAYMENT_OUTPUT.FIAT)),
  ]);

  const getMyPayment = async () => {
    const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    const option = await getPaymentByManager(accessToken);

    const paymentList = await getPayment();
    if (paymentList) {
      setPaymentList(paymentList);
    }

    const findToken = option?.payments.find(
      (token) => token.name === PAYMENT_OUTPUT.TOKEN
    );
    const findFiat = option?.payments.find(
      (fiat) => fiat.name === PAYMENT_OUTPUT.FIAT
    );

    if (option?.defaultPayment.name) {
      setValue("defaultValue", option?.defaultPayment.name);
    }

    setValue(parseReturnString(PAYMENT_OUTPUT.TOKEN), !!findToken);

    setValue(parseReturnString(PAYMENT_OUTPUT.FIAT), !!findFiat);
  };

  useEffect(() => {
    getMyPayment();
  }, []);

  const renderBody = () => {
    return (
      <>
        <div className="my-4 flex items-center justify-center text-center text-3xl font-bold text-primary-black">
          <div></div>
          <label htmlFor="" className="text-primary-yellow">{t("setting_payment_option")}</label>
        </div>

        <form onSubmit={handleSubmit(onHandleSubmit)}>
          <div className="py-5">
            <div className="h-30 w-50 m-auto">
              <label htmlFor="" className="font-semibold text-white">
                {t("payment_option")}
              </label>
              <div className="block">
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      {...register(parseReturnString(PAYMENT_OUTPUT.TOKEN))}
                      type="checkbox"
                    />
                    <div className="ml-2 text-white">{t("token")}</div>
                  </label>
                </div>
              </div>
              <div className="block">
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      {...register(parseReturnString(PAYMENT_OUTPUT.FIAT))}
                      type="checkbox"
                    />
                    <div className="ml-2 text-white">{t("fiat")}</div>
                  </label>
                </div>
              </div>
              {showDefaultOption()}
              <button
                disabled={isChange}
                className="my-2 flex w-full items-center justify-center rounded-full bg-primary-yellow py-2 text-white"
              >
                {loading ? <Loading /> : t("submit")}
              </button>
            </div>
          </div>
        </form>
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
