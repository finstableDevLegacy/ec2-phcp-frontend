import PHC_icon from "../../../public/assets/PHC_icon.png";
import phc_pay_logo_navbar from "../../../public/assets/phc_pay_logo_navbar.png";
import BriberyIcon from "../../../public/assets/pay_icon_home.png";
import ReceiveCashIcon from "../../../public/assets/receive_icon_home.png";
import MenuItem from "./MenuItem";
import { useTranslation } from "react-i18next";
import { useWindowSize } from "usehooks-ts";
// phc_pay_logo_navbar

export default function MainCard() {
  const { t } = useTranslation("index");
  const { width } = useWindowSize();

  return (
    <>
      <div>
        <div className="mt-8 flex flex-col items-center justify-center space-y-3 sm:mt-3 xl:mt-4">
          <div className="flex flex-col items-center justify-center">
            <img src={PHC_icon} alt="PHC_icon" className="w-20" />
            <img
              src={phc_pay_logo_navbar}
              alt="phc_pay_logo_navbar"
              className="w-48 pt-3"
            />
          </div>
        </div>
        <div className="mb-4 mt-4 flex flex-col items-center justify-center">
          <p className="text-center text-sm font-bold text-primary-yellow md:text-lg">
            {t("description_topic_1")}
          </p>
          <p className="text-center text-sm font-bold text-primary-yellow md:text-lg">
            {t("description_topic_2")}
          </p>
        </div>
        <div className="mb-10 flex flex-col items-center justify-center md:mb-10">
          <a
            className="rounded-lg border-2 border-primary-yellow px-8 py-2 font-light text-primary-yellow ring-primary-black transition-all hover:border-primary-yellow hover:bg-primary-yellow hover:text-white"
            href="https://phc.gitbook.io/phcpay/"
          >
            {t("learn_more").toLocaleUpperCase()}
          </a>
        </div>
        <div className="grid w-full max-w-2xl gap-3 pb-8 sm:grid-cols-2 sm:gap-5 md:pb-10">
          <MenuItem icon={BriberyIcon} title={"Pay"} path="/pay" />
          <MenuItem icon={ReceiveCashIcon} title={"Receive"} path="/merchant" />
        </div>
        {/* <SlideBanner /> */}
        {width >= 390 && (
          <div className="h-[1px] w-full items-center bg-[#EFBD3C]"></div>
        )}
      </div>
    </>
  );
}
