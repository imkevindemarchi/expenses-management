import React, { FC, ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

const Backdrop: FC<IProps> = ({ children }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
      {children}
    </div>
  );
};

export default Backdrop;
