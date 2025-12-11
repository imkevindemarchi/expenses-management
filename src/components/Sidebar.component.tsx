import React, { FC, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavigateFunction, useLocation, useNavigate } from "react-router";

// Api
import { AUTH_API } from "../api";

// Assets
import logoImg from "../assets/images/logo.png";
import { LogoutIcon, UserIcon } from "../assets/icons";

// Components
import LiquidGlass from "./LiquidGlass.component";
import LanguageSelector from "./LanguageSelector.component";

// Contexts
import { SidebarContext, TSidebarContext } from "../providers/sidebar.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

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
    LoaderContext
  ) as TLoaderContext;
  const { setIsUserAuthenticated }: TAuthContext = useContext(
    AuthContext
  ) as TAuthContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const [isUserDropdownOpened, setIsUserDropdownOpened] =
    useState<boolean>(false);
  const userLiquidGlassRef: any | null = useRef(null);

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
    <LiquidGlass borderRadius={20} onClick={goToHome}>
      <img
        src={logoImg}
        alt={t("imgNotFound")}
        className="w-28 h-28 hover:opacity-50 transition-all duration-300 cursor-pointer"
      />
    </LiquidGlass>
  );

  const routesComponent = (
    <div className="flex flex-col justify-center text-center items-center gap-5">
      {ROUTES.map((route: TRoute, index: number) => {
        const isRouteHidden: boolean = route.isHidden ? true : false;
        const routePathSection: string = route.path.split("/")[1];
        const isRouteActive: boolean = routePathSection === currentPathSection;

        return !isRouteHidden && isRouteActive ? (
          <LiquidGlass key={index} className="px-5 py-2">
            <span className="text-2xl text-white font-bold">
              {t(route.name).toUpperCase()}
            </span>
          </LiquidGlass>
        ) : (
          !isRouteHidden && (
            <div
              key={index}
              onClick={() => onRouteChange(route.path)}
              className="px-5 py-2 cursor-pointer"
            >
              <span className="text-2xl text-white font-bold">
                {t(route.name).toUpperCase()}
              </span>
            </div>
          )
        );
      })}
    </div>
  );

  const languageSelector = (
    <LanguageSelector value={language} onChange={onLanguageChange} />
  );

  const userIcon = (
    <LiquidGlass
      ref={userLiquidGlassRef}
      className="w-10 h-10 flex justify-center items-center relative"
    >
      <UserIcon
        onClick={() => setIsUserDropdownOpened(!isUserDropdownOpened)}
        className="w-6 h-6 text-white"
      />
      <div
        style={{ left: "50%", transform: "translate(-50%, 0)" }}
        className={`absolute top-0 transition-all duration-300 opacity-0 pointer-events-none ${
          isUserDropdownOpened && "top-12 opacity-100 pointer-events-auto"
        }`}
      >
        <LiquidGlass
          borderRadius={30}
          className="flex flex-col gap-5 justify-center items-center w-40 py-5"
        >
          <span
            onClick={() => onRouteChange("/profile")}
            className="text-white hover:opacity-50 transition-all duration-300"
          >
            {t("profile")}
          </span>
          <span
            onClick={() => onRouteChange("/password-reset")}
            className="text-white hover:opacity-50 transition-all duration-300"
          >
            {t("resetPassword")}
          </span>
        </LiquidGlass>
      </div>
    </LiquidGlass>
  );

  const logoutIcon = (
    <LiquidGlass className="w-10 h-10 flex justify-center items-center">
      <LogoutIcon onClick={onLogout} className="w-6 h-6 text-white" />
    </LiquidGlass>
  );

  return (
    <LiquidGlass
      className={`fixed left-0 w-full h-full flex justify-center items-center flex-col gap-10 desktop:hidden ${
        isOpen ? "top-0 opacity-100" : "top-[-100%] opacity-0"
      }`}
      borderRadius={0}
      borderBottomRadius={50}
      zIndex={150}
      blur={10}
    >
      {logo}
      {routesComponent}
      <div className="flex items-center gap-5">
        {languageSelector}
        {userIcon}
        {logoutIcon}
      </div>
    </LiquidGlass>
  );
};

export default Sidebar;
