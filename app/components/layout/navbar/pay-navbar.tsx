import { FC, Fragment, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "@remix-run/react";

// Components
import NetworkWallet from "../pay/wallet/network-wallet";

// Public
import Logo from "../../../../public/assets/PHC_icon.png";
import phc_logo from "../../../../public/assets/phc_pay_logo_navbar.png";

import { MenuIcon } from "@heroicons/react/outline";
import { Drawer } from "~/components/ui/Drawer";
import { XCircleIcon } from "@heroicons/react/solid";
import { DisplayOn } from "../pay/wallet/network-wallet";
import { useAccount } from "wagmi";

enum DrawerViewEnum {
  SIDEBAR_MOBILE = "Sidebar mobile",
}

export type NavigatorListType = {
  name: string;
  slug: string;
  logoUri?: string;
};

type IProps = {
  navigateList: NavigatorListType[];
  baseColor?: string;
  type?: string;
  redirectTo?: string;
};

const PayNavbar: FC<IProps> = ({
  navigateList,
  baseColor = "text-primary-light-blue",
  type = "PAY",
  redirectTo = "",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [{ data: accountData }] = useAccount();

  const isAccount = accountData?.address !== undefined;

  // Drawer
  const [drawerView, setDrawerView] = useState(DrawerViewEnum.SIDEBAR_MOBILE);
  const [isOpenSideBar, setIsOpenSidebar] = useState<boolean>(false);

  const [navigatorList, setNavigatorList] = useState<NavigatorListType[] | []>(
    navigateList
  );

  const DrawerView: FC<{ drawerDisplay: string; closeDrawer(): any }> = ({
    drawerDisplay,
    closeDrawer,
  }) => {
    return isOpenSideBar ? (
      <Drawer onClose={closeDrawer}>
        {drawerDisplay === DrawerViewEnum.SIDEBAR_MOBILE && <SidebarMobile />}
      </Drawer>
    ) : null;
  };

  const SidebarMobile = () => {
    return (
      <div className="relative flex flex-col text-gray-800">
        <div className="absolute flex w-full items-center justify-between px-4 py-3">
          <div className="h-8 w-28 md:w-36 md:h-10 lg:h-10 xl:h-10">
            <img src={phc_logo} alt="PHC logo" />
          </div>
          <div className="">
            <XCircleIcon
              className="w-10 fill-primary-yellow"
              onClick={() => setIsOpenSidebar(false)}
            ></XCircleIcon>
          </div>
        </div>
        <div className="mt-20 divide-y px-5">
          {accountData?.address && (
            <div className="flex flex-col divide-y">
              {navigatorList.map((item, index) => (
                <div
                  key={index}
                  className={`text-md py-5 font-medium ${
                    location.pathname === item.slug
                      ? "text-primary-yellow"
                      : "text-white"
                  }`}
                  onClick={() => {
                    setIsOpenSidebar(false), navigate(item.slug);
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
          <NetworkWallet
            displayOn={DisplayOn.MOBILE}
            redirectTo={`${location.pathname}${location.search}`}
            onConnect={() => setIsOpenSidebar(false)}
            onDisconnect={() => setIsOpenSidebar(false)}
          />
        </div>
      </div>
    );
  };

  const isDisplayNavbar = () => {
    return location.pathname === "/" ? "hidden" : "relative";
  };

  const handleOpenSidebar = () => {
    setDrawerView(DrawerViewEnum.SIDEBAR_MOBILE);
    setIsOpenSidebar(true);
  };

  return (
    <div
      className={`sticky top-0 z-50 bg-primary-black-gray py-2 px-4 shadow-md md:px-10 lg:w-full ${isDisplayNavbar()}`}
    >
      <div className="flex items-center justify-between">
        <Link to={"/pay"}>
          <div className="flex flex-row items-center">
            <img className="mr-5 w-16" src={Logo} alt="transcrypt logo" />
            <img
              className="w-30  h-10 sm:w-full"
              src={phc_logo}
              alt="transcrypt logo"
            />
          </div>
        </Link>
        <div className="hidden md:items-center md:space-x-8 xl:flex">
          {isAccount &&
            navigatorList.map((item) => (
              <NavLink
                end
                key={item.name}
                to={item.slug}
                className={({ isActive }) =>
                  isActive
                    ? "text-white hover:text-white"
                    : "border-white text-white hover:text-white"
                }
              >
                <p className="m-0 p-0 text-xl font-medium text-white">
                  {item.name}
                </p>
              </NavLink>
            ))}
          {/* Network and Wallet */}
          <NetworkWallet displayOn={DisplayOn.DESKTOP} redirectTo={"/pay"} />
        </div>

        {/* Mobile */}
        <div className="flex justify-center transition-all xl:hidden">
          <button onClick={handleOpenSidebar}>
            <MenuIcon className="w-7 text-gray-400"></MenuIcon>
          </button>
        </div>

        <DrawerView
          drawerDisplay={drawerView}
          closeDrawer={() => setIsOpenSidebar(false)}
        />
      </div>
    </div>
  );
};

export default PayNavbar;
