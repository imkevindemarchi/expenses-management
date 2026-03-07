import React, { FC, useContext } from "react";

// Assets
import { ArrowLeftIcon } from "../assets/icons";

// Components
import IconButton from "./IconButton.component";

// Contexts
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

interface IProps {
  onGoBack: (event: any) => void;
}

const GoBackButton: FC<IProps> = ({ onGoBack }) => {
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  return (
    <IconButton
      onClick={onGoBack}
      icon={
        <ArrowLeftIcon
          className={`text-2xl transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
        />
      }
      className={isLightMode ? "bg-lightgray" : "bg-darkgray2"}
      noShadow
    />
  );
};

export default GoBackButton;
