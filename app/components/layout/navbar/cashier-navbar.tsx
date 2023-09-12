import { useState, FC } from "react";
import { MenuIcon, XCircleIcon } from "@heroicons/react/solid";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import Logo from "../../../../public/assets/PHC_icon.png";
import { useTranslation } from "react-i18next";
import UserNavBar from "~/components/account-user-navbar";
import { ManagerData } from "~/type/manager";
import { MemberDetail } from "~/type/member";
import Drawer from "~/components/ui/Drawer/drawer";
import useAuthStore from "~/stores/auth-store";
import { useAccount } from "wagmi";
import phc_logo from "../../../../public/assets/phc_pay_logo_navbar.png";
import NetworkWallet, { DisplayOn } from "../manager/network-wallet";

enum DrawerViewEnum {
  SIDEBAR_MOBILE = "Sidebar mobile",
}

export default function CashierNavbar({
  cashierData,
  managerData,
}: {
  cashierData: MemberDetail;
  managerData: ManagerData | undefined;
}): JSX.Element {
  const { t } = useTranslation("common");
  const submit = useSubmit();
  const [isOpenSideBar, setIsOpenSidebar] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const logoutManager = useAuthStore((state) => state.logoutManager);
  const [drawerView, setDrawerView] = useState(DrawerViewEnum.SIDEBAR_MOBILE);
  const [, disconnect] = useAccount();
  const navigation =
    cashierData || managerData
      ? [
          { name: "Create", to: "/merchant/cashier" },
          { name: "Orders", to: "/merchant/order" },
          { name: "Go to Manager", to: "/merchant/manager" },
        ]
      : [
          {
            name: "Login",
            to: "/merchant/cashier/login",
          },
        ];

  const handleLogout = () => {
    logoutManager();
    disconnect();
    submit(null, {
      method: "post",
      action: "/cashier-logout",
    });
  };

  const handleOpenSidebar = () => {
    setDrawerView(DrawerViewEnum.SIDEBAR_MOBILE);
    setIsOpenSidebar(true);
  };

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
      <div className="relative flex flex-col text-gray-900">
        <div className="absolute flex w-full items-center justify-between px-4 py-3">
          <div className="h-8 w-28 md:h-10 md:w-36 lg:h-10 xl:h-10">
            <img src={phc_logo} alt="phc logo" />
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
            {cashierData || managerData ? (
              <>
                {navigation.map((item, index) => (
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
                  redirectTo={"/merchant/cashier"}
                  onConnect={() => setIsOpenSidebar(false)}
                  onDisconnect={() => {
                    logoutManager();
                    setIsOpenSidebar(false);
                  }}
                />
              </>
            ) : (
              <div
                className="text-md py-5 font-medium text-white"
                onClick={() => {
                  setIsOpenSidebar(false);
                  navigate("/merchant/cashier/login");
                }}
              >
                Login
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`sticky top-0 z-50 bg-primary-black-gray py-2 px-4 shadow-md md:px-10 lg:w-full ${
        location.pathname === "/" ? "hidden" : "relative"
      }`}
    >
      <div className="flex items-center justify-between">
        <Link to={"/"}>
          <div className="flex items-center">
            <div className="flex flex-row items-center">
              <img className="mr-5 w-16" src={Logo} alt="transcrypt logo" />
              <img
                src={phc_logo}
                className="h-8 w-24 sm:w-28 md:h-10 md:w-36 lg:h-10 xl:h-10"
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
        <>
          <div className="hidden xl:flex xl:items-center xl:space-x-8">
            {(cashierData || managerData) && (
              <>
                {navigation.map((item) => (
                  <NavLink
                    end
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      isActive
                        ? "hover:text-white-500 text-xl font-medium text-white underline underline-offset-4"
                        : "hover:text-white-900 text-xl font-medium text-white"
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
                <NetworkWallet
                  displayOn={DisplayOn.DESKTOP}
                  redirectTo={"/merchant/cashier"}
                  onDisconnect={() => logoutManager()}
                  isCashier={true}
                />
                <UserNavBar
                  data={managerData ? managerData : cashierData}
                  onLogout={handleLogout}
                />
              </>
            )}
          </div>
        </>

        {/* Mobile */}
        <div className="flex items-center xl:hidden">
          <button onClick={handleOpenSidebar}>
            <MenuIcon className="w-6 text-white"></MenuIcon>
          </button>
        </div>
        <DrawerView drawerDisplay={drawerView} closeDrawer={() => {}} />
      </div>
    </div>
  );
}
