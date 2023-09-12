import PayNavbar from "./navbar/pay-navbar";
import { useWindowSize } from "usehooks-ts";
import { useEffect, useState, useMemo } from "react";
import ContactUs from "~/components/landing/ContactUs";

// Public / assets
import MainBG from "../../../public/assets/bg_home_banner.png";
import MainBGMobile from "../../../public/assets/background_mobile.png";
import MenuSociol from "../../components/landing/MenuSocial";

import { useTranslation } from "react-i18next";

export type NavigatorListType = {
  name: string;
  slug: string;
  logoUri?: string;
};

export default function PayLayout({ children }: { children: React.ReactNode }) {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState("");
  const { t } = useTranslation("index");

  const rawNavigatorList: NavigatorListType[] = [
    { name: "Pay", slug: "/pay" },
    { name: "History", slug: "/pay/history" },
  ];

  useEffect(() => {
    if (initialSize < 768) {
      return setIsMobile(MainBGMobile);
    } else {
      return setIsMobile(MainBG);
    }
  }, [width]);

  const initialSize = useMemo(() => {
    return width;
  }, [width]);

  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden">
      <img
        src={isMobile}
        alt="MainBG"
        className="absolute -z-50 h-screen w-full object-fill"
      />
      <PayNavbar navigateList={rawNavigatorList} />
      <main className="container relative mx-auto grow px-4">{children}</main>
      {/* <div className="mb-5 flex flex-col items-center justify-center p-5 pb-5 sm:grid-cols-2">
        <h3 className="mb-4 text-xl font-light text-primary-yellow">
          {t("follow_us")}
        </h3>
        <MenuSociol />
      </div> */}
      <div className="flex flex-row  items-baseline justify-evenly">
        <div className="mt-20 flex flex-row items-center justify-center p-5 pb-5 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-xl font-light text-primary-yellow">
              {t("follow_us")}
            </h3>
            <MenuSociol />
          </div>
        </div>
        <div className="flex flex-row items-center p-5 pb-5 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-xl font-light text-primary-yellow">
              {t("assistant")}
            </h3>
            <ContactUs />
          </div>
        </div>
      </div>
    </div>
  );
}
