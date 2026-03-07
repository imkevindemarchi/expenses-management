import React, { FC, useContext } from "react";

// Components
import ShadowBox from "./ShadowBox.component";

// Contexts
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

export type TProgressBarStatus = "warning" | "danger" | "ok";

interface IProps {
  progress: number;
  status: TProgressBarStatus;
}

const ProgressBar: FC<IProps> = ({ progress, status }) => {
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  return (
    <ShadowBox
      noShadow
      noBorder
      className={`w-[300px] h-4 rounded-full overflow-hidden flex items-center gap-5 transition-all duration-300 ${isLightMode ? "bg-lightgray" : "bg-darkgray2"}`}
    >
      <div
        className={`h-full transition-all rounded-full ${status === "warning" ? "bg-warning-popup " : status === "danger" ? "bg-primary-red" : "bg-primary"}`}
        style={{ width: `${progress}%` }}
      />
    </ShadowBox>
  );
};

export default ProgressBar;
