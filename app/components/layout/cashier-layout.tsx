import { ManagerData } from "~/type/manager";
import { MemberDetail } from "~/type/member";
import MainBG from "../../../public/assets/bg_home_banner.png";
import MainBGMobile from "../../../public/assets/background_mobile.png";
import CashierNavbar from "./navbar/cashier-navbar";
import { useWindowSize } from "usehooks-ts";
import { useEffect, useState, useMemo } from "react";

export default function CashierLayout({
  children,
  cashierData,
  managerData,
}: {
  children: React.ReactNode;
  cashierData: MemberDetail;
  managerData: ManagerData | undefined;
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
      <CashierNavbar cashierData={cashierData} managerData={managerData} />
      <main className="container relative mx-auto grow px-4">{children}</main>
    </div>
  );
}
