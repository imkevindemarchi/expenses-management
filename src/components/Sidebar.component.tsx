import React, { FC, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavigateFunction, useLocation, useNavigate } from "react-router";

// Api
import { AUTH_API } from "../api";

// Assets
import {
  EuroIcon,
  LockIcon,
  LogoutIcon,
  SettingsIcon,
  UserIcon,
} from "../assets/icons";
import { Z_INDEX } from "../assets/constants";

// Components
import LanguageSelector from "./LanguageSelector.component";
import ShadowBox from "./ShadowBox.component";
import IconButton from "./IconButton.component";

// Contexts
import { SidebarContext, TSidebarContext } from "../providers/sidebar.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

// Hooks
import { useClickOutside } from "../hooks";

// Types
import { ROUTES, TRoute } from "../routes";
import { THTTPResponse } from "../types";

// Utils
import { removeFromStorage, setToStorage } from "../utils";

const Sidebar: FC = () => {
  const {
    t,
    i18n: { language, changeLanguage },
  } = useTranslation();
  const { isOpen, onStateChange: onSidebarStateChange }: TSidebarContext =
    useContext(SidebarContext) as TSidebarContext;
  const navigate: NavigateFunction = useNavigate();
  const { pathname } = useLocation();
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext,
  ) as TLoaderContext;
  const { setIsUserAuthenticated, userData }: TAuthContext = useContext(
    AuthContext,
  ) as TAuthContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const [isUserDropdownOpened, setIsUserDropdownOpened] =
    useState<boolean>(false);
  const userLiquidGlassRef: any | null = useRef(null);
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  const currentPaths: string[] = pathname.split("/");
  const currentPathSection: string = currentPaths[1];

  function goToHome(): void {
    navigate("/");
    onSidebarStateChange();
  }

  function onRouteChange(path: string): void {
    navigate(path);
    onSidebarStateChange();
  }

  function onLanguageChange(countryCode: string): void {
    changeLanguage(countryCode);
    setToStorage("language", countryCode);
  }

  async function onLogout(): Promise<void> {
    setIsLoading(true);

    await Promise.resolve(AUTH_API.logout()).then((response: THTTPResponse) => {
      if (response.hasSuccess) {
        navigate("/log-in");
        removeFromStorage("token");
        setIsUserAuthenticated(false);
      } else openPopup(t("logoutError"), "error");
    });
    onSidebarStateChange();

    setIsLoading(false);
  }

  useClickOutside(userLiquidGlassRef, () => setIsUserDropdownOpened(false));

  const logo = (
    <div onClick={goToHome} className="flex items-center gap-5">
      <EuroIcon className="text-[5em] text-primary cursor-pointer hover:opacity-50 transition-all duration-300" />
      <span
        className={`text-[3em] transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
      >
        {t("finances")}
      </span>
    </div>
  );

  const routesComponent = (
    <div className="flex flex-col justify-center text-center items-center mobile:gap-5">
      {ROUTES.map((route: TRoute, index: number) => {
        const isRouteHidden: boolean = route.isHidden ? true : false;
        const routePathSection: string = route.path.split("/")[1];
        const isRouteActive: boolean = routePathSection === currentPathSection;

        return !isRouteHidden && isRouteActive ? (
          <div key={index} className="flex flex-col gap-10 relative">
            <span
              onClick={() => onRouteChange(route.path)}
              className={`text-xl hover:opacity-50 transition-all duration-300 cursor-pointer ${isLightMode ? "text-black" : "text-white"}`}
            >
              {t(route.name)}
            </span>
            <div className="bg-primary w-full h-[2px] absolute bottom-[-20px] mobile:bottom-[-10px] rounded-full" />
          </div>
        ) : (
          !isRouteHidden && (
            <span
              key={index}
              onClick={() => onRouteChange(route.path)}
              className={`text-xl hover:opacity-50 transition-all duration-300 cursor-pointer ${isLightMode ? "text-darkgray" : "text-gray"}`}
            >
              {t(route.name)}
            </span>
          )
        );
      })}
    </div>
  );

  const languageSelector = (
    <LanguageSelector value={language} onChange={onLanguageChange} />
  );

  const userIcon = (
    <div
      ref={userLiquidGlassRef}
      onClick={() => setIsUserDropdownOpened(!isUserDropdownOpened)}
      className={`border-2 w-10 h-10 flex justify-center items-center cursor-pointer relative rounded-full ${isUserDropdownOpened ? "" : "hover:opacity-50 transition-all duration-300"} ${isLightMode ? "bg-lightgray border-lightgray" : "bg-darkgray2 border-darkgray2"}`}
    >
      <div className="relative">
        <UserIcon
          className={`transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
        />
        <div
          style={{ left: "50%", transform: "translate(-50%, 0)" }}
          className={`absolute top-0 transition-all duration-300 opacity-0 pointer-events-none ${
            isUserDropdownOpened && "top-12 opacity-100 pointer-events-auto"
          }`}
        >
          <ShadowBox
            borderRadius={30}
            className={`flex flex-col gap-5 justify-center items-center p-5 transition-all duration-300 ${isLightMode ? "bg-white" : "bg-black"}`}
          >
            <span className="text-primary underline cursor-default">
              {userData?.email}
            </span>
            <div
              onClick={() => onRouteChange("/settings")}
              className="flex items-center gap-2 hover:opacity-50 transition-all duration-300"
            >
              <SettingsIcon className="text-2xl text-darkgray" />
              <span
                className={`transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
              >
                {t("settings")}
              </span>
            </div>
            <div
              onClick={() => onRouteChange("/password-reset")}
              className="flex items-center gap-2 hover:opacity-50 transition-all duration-300"
            >
              <LockIcon className="text-xl text-darkgray" />
              <span
                className={`transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
              >
                {t("resetPassword")}
              </span>
            </div>
            {/* <span
              onClick={() => navigate("/profile")}
              className="text-white hover:opacity-50 transition-all duration-300"
            >
              {t("profile")}
            </span> */}
          </ShadowBox>
        </div>
      </div>
    </div>
  );

  const logoutIcon = (
    <IconButton
      onClick={onLogout}
      icon={
        <LogoutIcon
          className={`transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
        />
      }
      className={`w-10 h-10 relative border-2 transition-all duration-300 ${isLightMode ? "bg-lightgray border-lightgray" : "bg-darkgray2 border-darkgray2"}`}
    />
  );

  const icons = (
    <div className="flex items-center gap-5">
      {languageSelector}
      {userIcon}
      {logoutIcon}
    </div>
  );

  return (
    <ShadowBox
      className={`fixed left-0 w-full h-full flex justify-center items-center flex-col gap-10 desktop:hidden ${
        isOpen ? "top-0 opacity-100" : "top-[-100%] opacity-0"
      } ${isLightMode ? "bg-white" : "bg-black"}`}
      borderRadius={0}
      zIndex={Z_INDEX.SIDEBAR}
      noBorder
    >
      {logo}
      {routesComponent}
      {icons}
    </ShadowBox>
  );
};

export default Sidebar;
