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
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

// Types
import { ROUTES, TRoute } from "../routes";
import { THTTPResponse } from "../types";

// Utils
import { removeFromStorage, setToStorage } from "../utils";
import { useClickOutside } from "../hooks";

const Navbar: FC = () => {
  const {
    t,
    i18n: { language, changeLanguage },
  } = useTranslation();
  const { pathname } = useLocation();
  const navigate: NavigateFunction = useNavigate();
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext
  ) as TLoaderContext;
  const { setIsUserAuthenticated }: TAuthContext = useContext(
    AuthContext
  ) as TAuthContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const [isOnTopOfPage, setIsOnTopOfPage] = useState<boolean>(true);
  const [isUserDropdownOpened, setIsUserDropdownOpened] =
    useState<boolean>(true);
  const userLiquidGlassRef: any | null = useRef(null);

  const currentPaths: string[] = pathname.split("/");
  const currentPathSection: string = currentPaths[1];

  function goToHome(): void {
    navigate("/");
  }

  function onRouteChange(path: string): void {
    navigate(path);
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

    setIsLoading(false);
  }

  useClickOutside(userLiquidGlassRef, () => setIsUserDropdownOpened(false));

  const logo = (
    <LiquidGlass
      borderRadius={20}
      onClick={goToHome}
      className={`${isOnTopOfPage ? "w-20 h-20" : "w-14 h-14"}`}
    >
      <img
        src={logoImg}
        alt={t("imgNotFound")}
        onClick={goToHome}
        className="w-full hover:opacity-50 transition-all duration-300 cursor-pointer"
      />
    </LiquidGlass>
  );

  const routesComponent = (
    <LiquidGlass className="flex items-center">
      {ROUTES.map((route: TRoute, index: number) => {
        const isRouteHidden: boolean = route.isHidden ? true : false;
        const routePathSection: string = route.path.split("/")[1];
        const isRouteActive: boolean = routePathSection === currentPathSection;

        return !isRouteHidden && isRouteActive ? (
          <LiquidGlass key={index} className="px-5 py-2">
            <span className="text-white font-bold">
              {t(route.name).toUpperCase()}
            </span>
          </LiquidGlass>
        ) : (
          !isRouteHidden && (
            <div
              key={index}
              onClick={() => onRouteChange(route.path)}
              className="px-5 py-2 cursor-pointer hover:opacity-50 transition-all duration-300"
            >
              <span className="text-white font-bold">
                {t(route.name).toUpperCase()}
              </span>
            </div>
          )
        );
      })}
    </LiquidGlass>
  );

  const languageSelector = (
    <LanguageSelector value={language} onChange={onLanguageChange} />
  );

  const logoutIcon = (
    <LiquidGlass
      onClick={onLogout}
      className="w-10 h-10 flex justify-center items-center hover:opacity-50 cursor-pointer"
    >
      <LogoutIcon className="text-white text-xl" />
    </LiquidGlass>
  );

  const userIcon = (
    <LiquidGlass
      ref={userLiquidGlassRef}
      onClick={() => setIsUserDropdownOpened(!isUserDropdownOpened)}
      className="w-10 h-10 flex justify-center items-center cursor-pointer relative"
    >
      <UserIcon className="text-white text-xl" />
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
            onClick={() => navigate("/settings")}
            className="text-white hover:opacity-50 transition-all duration-300"
          >
            {t("profile")}
          </span>
          <span
            onClick={() => navigate("/password-reset")}
            className="text-white hover:opacity-50 transition-all duration-300"
          >
            {t("resetPassword")}
          </span>
        </LiquidGlass>
      </div>
    </LiquidGlass>
  );

  window.addEventListener("scroll", () => {
    setIsOnTopOfPage(window.scrollY === 0);
  });

  return (
    <LiquidGlass
      borderRadius={0}
      borderBottomRadius={50}
      blur={10}
      style={{ zIndex: 100 }}
      className={`w-full fixed flex items-center px-20 justify-between mobile:hidden ${
        isOnTopOfPage ? "h-36" : "h-16"
      }`}
    >
      <div className="flex items-center gap-5">
        {logo}
        {routesComponent}
      </div>
      <div className="flex items-center gap-5">
        {languageSelector}
        {userIcon}
        {logoutIcon}
      </div>
    </LiquidGlass>
  );
};

export default Navbar;
