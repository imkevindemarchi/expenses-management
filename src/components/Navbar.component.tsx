import React, { FC, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavigateFunction, useLocation, useNavigate } from "react-router";
import { Grid } from "@mui/material";

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

// Components
import LanguageSelector from "./LanguageSelector.component";
import ShadowBox from "./ShadowBox.component";
import IconButton from "./IconButton.component";

// Contexts
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

const Navbar: FC = () => {
  const {
    t,
    i18n: { language, changeLanguage },
  } = useTranslation();
  const { pathname } = useLocation();
  const navigate: NavigateFunction = useNavigate();
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext,
  ) as TLoaderContext;
  const { setIsUserAuthenticated, userData }: TAuthContext = useContext(
    AuthContext,
  ) as TAuthContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const [isOnTopOfPage, setIsOnTopOfPage] = useState<boolean>(true);
  const [isUserDropdownOpened, setIsUserDropdownOpened] =
    useState<boolean>(false);
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
    <div className="flex items-center gap-5">
      <EuroIcon
        onClick={goToHome}
        className="text-[3em] text-primary cursor-pointer hover:opacity-50 transition-all duration-300"
      />
      <span className="text-black text-3xl">{t("finances")}</span>
    </div>
  );

  const routes = (
    <div className="h-full flex items-center gap-10">
      {ROUTES.map((route: TRoute, index: number) => {
        const isRouteHidden: boolean = route.isHidden ? true : false;
        const routePathSection: string = route.path.split("/")[1];
        const isRouteActive: boolean = routePathSection === currentPathSection;

        return !isRouteHidden && isRouteActive ? (
          <div key={index} className="flex flex-col gap-10 relative">
            <span
              onClick={() => onRouteChange(route.path)}
              className="text-black hover:opacity-50 transition-all duration-300 cursor-pointer"
            >
              {t(route.name)}
            </span>
            <div className="bg-primary w-full h-[2px] absolute bottom-[-20px] rounded-full" />
          </div>
        ) : (
          !isRouteHidden && (
            <span
              key={index}
              onClick={() => onRouteChange(route.path)}
              className="text-darkgray hover:opacity-50 transition-all duration-300 cursor-pointer"
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
      className={`border-2 border-lightgray w-10 h-10 flex justify-center items-center cursor-pointer relative bg-lightgray rounded-full ${isUserDropdownOpened ? "" : "hover:opacity-50 transition-all duration-300"}`}
    >
      <div className="relative">
        <UserIcon className="text-black" />
        <div
          style={{ left: "50%", transform: "translate(-50%, 0)" }}
          className={`absolute top-0 transition-all duration-300 opacity-0 pointer-events-none ${
            isUserDropdownOpened && "top-12 opacity-100 pointer-events-auto"
          }`}
        >
          <ShadowBox
            borderRadius={30}
            className="flex flex-col gap-5 justify-center items-center p-5 bg-white"
          >
            <span className="text-primary underline cursor-default">
              {userData?.email}
            </span>
            <div
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 hover:opacity-50 transition-all duration-300"
            >
              <SettingsIcon className="text-darkgray text-2xl" />
              <span className="text-black">{t("settings")}</span>
            </div>
            <div
              onClick={() => navigate("/password-reset")}
              className="flex items-center gap-2 hover:opacity-50 transition-all duration-300"
            >
              <LockIcon className="text-darkgray text-xl" />
              <span className="text-black">{t("resetPassword")}</span>
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
      icon={<LogoutIcon className="text-black text-xl" />}
      className="border-lightgray w-10 h-10 relative bg-white border-2"
    />
  );

  const icons = (
    <div className="h-full flex items-center gap-5">
      {languageSelector}
      {userIcon}
      {logoutIcon}
    </div>
  );

  window.addEventListener("scroll", () => {
    setIsOnTopOfPage(window.scrollY === 0);
  });

  return (
    <div
      className={`w-full fixed flex items-center justify-between mobile:hidden px-20 border-b-[1px] border-lightgray bg-white transition-all duration-300 ${
        isOnTopOfPage ? "h-36" : "h-16"
      }`}
    >
      <Grid container sx={{ width: "100%" }}>
        <Grid size={{ xs: 2 }}>{logo}</Grid>
        <Grid size={{ xs: 8 }}>{routes}</Grid>
        <Grid size={{ xs: 2 }}>{icons}</Grid>
      </Grid>
    </div>
  );
};

export default Navbar;
