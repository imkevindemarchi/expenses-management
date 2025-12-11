import React, { FC, ReactNode, useContext } from "react";
import { useLocation } from "react-router";

// Assets
import wallpaperImg from "../assets/images/wallpaper.jpg";

// Components
import Loader from "./Loader.component";
import Popup from "./Popup.component";
import Navbar from "./Navbar.component";
import Sidebar from "./Sidebar.component";
import Hamburger from "./Hamburger.component";
import Breadcrumb from "./Breadcrumb.component";

// Contexts
import { SidebarContext, TSidebarContext } from "../providers/sidebar.provider";

interface IProps {
  children: ReactNode;
}

const Layout: FC<IProps> = ({ children }) => {
  const { pathname } = useLocation();
  const {
    isOpen: isSidebarOpen,
    onStateChange: onSidebarStateChange,
  }: TSidebarContext = useContext(SidebarContext) as TSidebarContext;

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

  const layout = (
    <div
      style={{
        backgroundImage: `url("${wallpaperImg}")`,
      }}
      className="min-h-[100vh] bg-cover"
    >
      {navbar}
      {hamburger}
      {sidebar}
      <div className="px-60 py-10 w-full min-h-[100vh] mobile:min-h-[110vh] mobile:px-5 mobile:pt-28 flex flex-col gap-5 pt-52">
        {breadcrumb}
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full relative">
      {isLoginPage ? loginLayout : layout}
      {loader}
      {popup}
    </div>
  );
};

export default Layout;
