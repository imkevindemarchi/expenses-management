import React, { FC, ReactNode } from "react";

// Components
import Loader from "./Loader.component";
import Popup from "./Popup.component";

interface IProps {
  children: ReactNode;
}

const Layout: FC<IProps> = ({ children }) => {
  const loader = <Loader />;

  const popup = <Popup />;

  return (
    <div className="w-full h-full relative">
      {children}
      {loader}
      {popup}
    </div>
  );
};

export default Layout;
