import React, { FC, ReactNode } from "react";

interface IProps {
  noBackground?: boolean;
  children: ReactNode;
}

const Backdrop: FC<IProps> = ({ noBackground = false, children }) => {
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full flex justify-center items-center z-10 ${noBackground ? "" : "bg-backdrop"}`}
    >
      {children}
    </div>
  );
};

export default Backdrop;
