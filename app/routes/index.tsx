import Layout from "~/components/layout";
import MainCard from "../components/landing/MainCard";
import phcp_icon from "../../public/assets/PHC_icon.png";
import FlaminGo from "../../public/assets/FlaminGo.png";
import { useTranslation } from "react-i18next";
import MenuSocial from "~/components/landing/MenuSocial";
export let handle = {
  i18n: ["index", "common"],
};

export default function IndexPage() {
  const { t } = useTranslation("index");

  return (
    <Layout>
      <div className="flex h-screen w-full flex-col items-center justify-center p-5 lg:p-28 xl:p-36">
        <MainCard />
        <div>
          <p className="text-md mt-2 mb-0 items-center text-center font-medium text-primary-yellow md:mb-10 lg:text-xl xl:text-2xl">
            {t("discover")}
          </p>
          <div className="flex justify-center">
            <a href="https://www.tradingpool.online/">
              <div className="mt-5 flex items-center justify-center">
                <button className="flex h-[50px] w-60 items-center justify-center rounded-md border-2 border-[#1B9BE6] bg-[#222425] p-2 md:h-[60px] ">
                  <img
                    src={phcp_icon}
                    alt="PHC_icon"
                    className="h-8 w-9 object-contain md:h-9 md:w-10"
                  />
                  <span className="ml-2 items-center text-center text-lg text-white">
                    BUY PHCP
                  </span>
                </button>
              </div>
            </a>
          </div>
          <div className="mt-2 flex flex-col items-center justify-center p-5 sm:grid-cols-2 lg:mt-3 xl:mt-3">
            <h3 className="mb-5 text-lg font-semibold tracking-wide text-primary-yellow">
              {t("follow_us")}
            </h3>
            <MenuSocial />
          </div>
        </div>
      </div>
      <script
        src="//code.tidio.co/1etma6jpx12exvbrgc4anebkwn02p0pc.js"
        async
      ></script>
    </Layout>
  );
}
