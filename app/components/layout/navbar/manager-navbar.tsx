import { useState, FC, useEffect } from "react";
import { MenuIcon, XCircleIcon } from "@heroicons/react/solid";
import { Link, NavLink, useLocation, useNavigate } from "@remix-run/react";
import Logo from "../../../../public/assets/PHC_icon.png";
import { useTranslation } from "react-i18next";
import { useManagerInfo } from "~/hooks/useManagerInfo";
import { Drawer } from "~/components/ui/Drawer";
import { useAccount, useConnect } from "wagmi";
import useAuthStore from "~/stores/auth-store";
import NetworkWallet, { DisplayOn } from "../manager/network-wallet";
import { useIsMounted } from "~/hooks";
import phc_logo from "../../../../public/assets/phc_pay_logo_navbar.png";

enum DrawerViewEnum {
  SIDEBAR_MOBILE = "Sidebar mobile",
}

export default function ManagerNavbar(): JSX.Element {
  const { t } = useTranslation("common");
  const [{ data: accountData }] = useAccount();
  const [{ loading }] = useConnect();

  const location = useLocation();
  const navigate = useNavigate();
  const isMounted = useIsMounted();

  const logoutManager = useAuthStore((state) => state.logoutManager);
  const accessToken = useAuthStore((state) => state.managerAccessToken);
  const logout = useAuthStore((state) => state.logoutManager);
  const isAccount = accountData?.address !== undefined;

  useEffect(() => {
    if (accessToken && !accountData?.address && !loading) {
      logout();
    }
  }, [accountData?.address, loading]);

  const managerAddress = accountData?.address!;
  const { managerData } = useManagerInfo(managerAddress);
  const [isOpenSideBar, setIsOpenSidebar] = useState<boolean>(false);
  const [drawerView, setDrawerView] = useState(DrawerViewEnum.SIDEBAR_MOBILE);

  const navigation = managerData
    ? [
        { name: "Home", to: "/merchant/manager" },
        { name: "Wallet", to: "/merchant/manager/wallet" },
        { name: "Manage", to: "/merchant/manager/memberlist" },
        { name: "Orders", to: "/merchant/manager/orders/token" },
        { name: "Go to Cashier", to: "/merchant/cashier" },
      ]
    : [];

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
      <div className="relative flex flex-col text-white">
        <div className="absolute flex w-full items-center justify-between px-4 py-3">
          <div className="h-8 w-36 md:h-10 lg:h-10 xl:h-10">
            <img src={phc_logo} alt="transcrypt logo" />
          </div>
          <div className="">
            <XCircleIcon
              className="w-10 fill-primary-yellow"
              onClick={() => setIsOpenSidebar(false)}
            ></XCircleIcon>
          </div>
        </div>
        <div className="mt-20 divide-y px-5">
          <div className="flex flex-col divide-y">
            {accessToken &&
              navigation.map((item, index) => (
                <div
                  key={index}
                  className={`text-md py-5 font-medium ${
                    location.pathname === item.to
                      ? "text-primary-yellow"
                      : "text-white"
                  }`}
                  onClick={() => {
                    setIsOpenSidebar(false);
                    navigate(item.to);
                  }}
                >
                  {item.name}
                </div>
              ))}

            <NetworkWallet
              displayOn={DisplayOn.MOBILE}
              redirectTo={"/merchant/manager"}
              onConnect={() => setIsOpenSidebar(false)}
              onDisconnect={() => {
                logoutManager();
                setIsOpenSidebar(false);
              }}
            />
          </div>
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
      className={`sticky top-0 z-50 w-full bg-primary-black-gray py-2 px-4 shadow-md md:px-10 lg:w-full ${isDisplayNavbar()}`}
    >
      <div className="flex items-center justify-between">
        <Link to={"/"}>
          <div className="flex items-center">
            <div className="flex flex-row items-center">
              <img className="mr-5 w-16" src={Logo} alt="transcrypt logo" />
              <img
                className="h-8 w-24 sm:w-28 md:h-10 md:w-36 lg:h-10 xl:h-10"
                src={phc_logo}
                alt="transcrypt logo"
              />
            </div>
            <div className="m-0 ml-3 p-0 text-lg font-bold text-gray-700">
              <div className="flex space-x-1">
                <span className="text-center text-2xl text-white md:text-3xl">
                  Merchant
                </span>
              </div>
            </div>
          </div>
        </Link>
        <div className="hidden xl:flex xl:items-center xl:space-x-8">
          {isAccount &&
            navigation.map((item) => (
              <NavLink
                end
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "hover:text-white-900 text-xl font-medium text-white underline underline-offset-4"
                    : "text-xl font-medium text-white hover:text-white"
                }
              >
                {item.name}
              </NavLink>
            ))}
          <NetworkWallet
            displayOn={DisplayOn.DESKTOP}
            redirectTo={"/merchant/manager"}
            onDisconnect={() => logoutManager()}
          />
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
}
