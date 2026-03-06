import React, { FC, MouseEvent } from "react";

// Components
import ShadowBox from "./ShadowBox.component";

type TButtonType = "button" | "submit" | "reset";

type TButtonVariant = "primary" | "secondary";

interface IProps {
  text: string;
  type?: TButtonType;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  icon?: any;
  className?: string;
  zIndex?: number;
  variant?: TButtonVariant;
  readOnly?: boolean;
}

const Button: FC<IProps> = ({
  type = "button",
  text,
  onClick,
  icon,
  className,
  zIndex,
  variant = "primary",
  readOnly = false,
}) => {
  switch (variant) {
    case "primary": {
      return (
        <ShadowBox zIndex={zIndex} className={`w-fit ${className}`}>
          <button
            onClick={(event: any) => !readOnly && onClick && onClick(event)}
            type={type}
            className={`px-5 py-2 w-full flex justify-center items-center gap-1 ${!readOnly ? "hover:opacity-50 transition-all duration-300 cursor-pointer" : "cursor-default"}`}
          >
            {icon && icon}
            <span className="text-base text-white">{text}</span>
          </button>
        </ShadowBox>
      );
    }
    case "secondary": {
      return (
        <span
          onClick={onClick}
          className="text-base text-darkgray underline-offset-4 underline cursor-pointer hover:opacity-50 transition-all duration-300"
        >
          {text}
        </span>
      );
    }
  }
};

export default Button;
