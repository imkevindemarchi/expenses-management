import React, { FC, ReactNode, useContext } from "react";
import { useLocation } from "react-router";

// Assets
import { isMobile } from "../assets/constants";

// Components
import Loader from "./Loader.component";
import Popup from "./Popup.component";
import Navbar from "./Navbar.component";
import Sidebar from "./Sidebar.component";
import Hamburger from "./Hamburger.component";
import Breadcrumb from "./Breadcrumb.component";
import BackToTopButton from "./BackToTopButton.component";
import IconButton from "./IconButton.component";

// Contexts
import { SidebarContext, TSidebarContext } from "../providers/sidebar.provider";
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

// Icons
import { MoonIcon } from "../assets/icons";

interface IProps {
  children: ReactNode;
}

const Layout: FC<IProps> = ({ children }) => {
  const { pathname } = useLocation();
  const {
    isOpen: isSidebarOpen,
    onStateChange: onSidebarStateChange,
  }: TSidebarContext = useContext(SidebarContext) as TSidebarContext;
  const { isLightMode, stateHandler: themeHandler }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  const currentPathSection: string = pathname.split("/")[1];

  const isLoginPage: boolean = currentPathSection === "log-in";

  const loader = <Loader />;

  const popup = <Popup />;

  const loginLayout = children;

  const navbar = <Navbar />;

  const hamburger = (
    <Hamburger isActive={isSidebarOpen} onClick={onSidebarStateChange} />
  );

  const sidebar = <Sidebar />;

  const breadcrumb = <Breadcrumb />;

  const mobileThemeIcon = (
    <div className="w-full flex justify-center items-center pt-5">
      <IconButton
        onClick={themeHandler}
        icon={
          <MoonIcon
            className={`text-2xl transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
          />
        }
        className={`w-14 h-14 relative border-2 transition-all duration-300 ${isLightMode ? "bg-lightgray border-lightgray" : "bg-darkgray2 border-darkgray2"}`}
      />
    </div>
  );

  const layout = (
    <div
      className={`min-h-[100vh] bg-cover transition-all duration-300 ${isLightMode ? "bg-white" : "bg-black"}`}
    >
      {navbar}
      {hamburger}
      {sidebar}
      {isMobile && mobileThemeIcon}
      <div className="px-60 py-10 w-full min-h-[100vh] mobile:px-5 mobile:pt-10 flex flex-col gap-5 pt-52">
        {breadcrumb}
        {children}
      </div>
    </div>
  );

  const backToTopButton = <BackToTopButton />;

  return (
    <div className="w-full h-full relative">
      {isLoginPage ? loginLayout : layout}
      {loader}
      {popup}
      {backToTopButton}
    </div>
  );
};

export default Layout;
