import MainBG from "../../../public/assets/bg_home_banner.png";
import MainBGMobile from "../../../public/assets/background_mobile.png";
import { useWindowSize } from "usehooks-ts";
import { useEffect, useMemo, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="background-phc h-screen  overflow-y-auto ">
      <main className="container relative mx-auto h-screen grow px-4">
        {children}
      </main>
    </div>
  );
}
