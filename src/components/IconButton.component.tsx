import React, { FC, ReactNode } from "react";

// Components
import ShadowBox from "./ShadowBox.component";

interface IProps {
  onClick: (event: any) => void;
  icon: ReactNode;
  className?: string;
  ref?: any;
  noBorder?: boolean;
  noShadow?: boolean;
}

const IconButton: FC<IProps> = ({
  onClick,
  icon,
  className,
  ref,
  noBorder,
  noShadow,
}) => {
  return (
    <ShadowBox
      ref={ref}
      onClick={onClick}
      noBorder={noBorder}
      noShadow={noShadow}
      className={`p-2 flex justify-center items-center cursor-pointer relative rounded-full hover:opacity-50 transition-all duration-300 ${className}`}
    >
      {icon}
    </ShadowBox>
  );
};

export default IconButton;
