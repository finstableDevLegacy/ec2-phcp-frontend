import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@remix-run/react";

const ScanQRCard = () => {
  const [data, setData] = useState("");
  const { t } = useTranslation("wallet");
  const navigator = useNavigate();

  useEffect(() => {
    if (data) {
      window.location.href = data;
      // navigator(data, { replace: true });
    }
  }, [data]);

  const handleSccanQr = async (result: any, error: any) => {
    if (!!result) {
      setData(result?.getText());
    }
    if (!!error) {
      console.info(error);
    }
  };

  return (
    <div>
      <div className="flex h-full items-center justify-center">
        <div className="wallet-pay mt-10 flex w-[80vw] flex-col items-center justify-center rounded-md bg-white py-5 px-5 shadow-lg shadow-broker-grey/20 md:w-auto md:px-20">
          <p className="py-5 text-3xl font-bold text-primary-yellow">
            {t("wallet")}
          </p>
          <div className="bg-[#22242] flex h-auto w-full flex-col items-center justify-center rounded-md md:h-64 md:w-80 md:shadow-lg md:shadow-broker-grey/20">
            <QrReader
              onResult={(result, error) => handleSccanQr(result, error)}
              constraints={{ facingMode: "environment" }}
              containerStyle={{ width: "120%", height: "128%" }}
              videoContainerStyle={{ width: "100%", height: "100​%" }}
              videoStyle={{ borderRadius: "30px" }}
            />
          </div>
          <p className="mt-4 mb-4 text-sm text-white">{t("please_scan_qr")}</p>
          <button
            className="mb-4 flex h-12 w-48 items-center justify-around rounded-full bg-primary-yellow p-2 text-center text-slate-100 shadow-md"
            onClick={() => navigator("/pay")}
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ScanQRCard;
