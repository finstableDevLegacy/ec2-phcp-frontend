import MainBG from "../../../public/assets/bg_home_banner.png";
import MerchantNavbar from "./navbar/merchant-navbar";
import MainBGMobile from "../../../public/assets/background_mobile.png";
import { useWindowSize } from "usehooks-ts";
import { useEffect, useState, useMemo } from "react";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState("");

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
    <div className="overflow-y-auto overflow-x-hidden">
      <img
        src={isMobile}
        alt="MainBG"
        className="absolute -z-50 h-screen w-full object-fill"
      />
      <MerchantNavbar />
      <main className="container relative mx-auto grow px-4">{children}</main>
    </div>
  );
}
