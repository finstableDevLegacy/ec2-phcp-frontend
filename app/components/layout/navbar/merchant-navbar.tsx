import { Link } from "@remix-run/react";
import Logo from "../../../../public/assets/phc_pay_logo_navbar.png";
import logo_phc from "../../../../public/assets/PHC_icon.png";

export default function MerchantNavbar(): JSX.Element {
  return (
    <div
      className={`sticky top-0 z-50 w-full  bg-primary-black-gray py-5 px-4 shadow-md md:px-10 lg:w-full`}
    >
      <div className="relative">
        <nav
          className="relative flex items-center justify-between sm:h-10 lg:justify-start"
          aria-label="Global"
        >
          <div className="flex flex-shrink-0 flex-grow items-center">
            <div className="flex w-full items-center justify-between md:w-auto">
              <Link to={"/"}>
                <div className="flex items-center">
                  <div className="flex flex-row items-center">
                  <img
                      className="mr-5 w-16"
                      src={logo_phc}
                      alt="transcrypt logo"
                    />
                    <img src={Logo} className="h-8 w-28 md:w-36 md:h-10 lg:h-10 xl:h-10" alt="PHC logo" />
                  </div>
                  <div className="m-0 ml-3 p-0 font-bold text-gray-700">
                    <div className="flex items-center justify-center">
                      <span className="text-2xl md:text-3xl text-white">Merchant</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
