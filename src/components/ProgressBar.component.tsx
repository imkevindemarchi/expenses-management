import React, { FC } from "react";

// Components
import ShadowBox from "./ShadowBox.component";

export type TProgressBarStatus = "warning" | "danger" | "ok";

interface IProps {
  progress: number;
  status: TProgressBarStatus;
}

const ProgressBar: FC<IProps> = ({ progress, status }) => {
  return (
    <ShadowBox
      noShadow
      noBorder
      className="w-[300px] h-4 rounded-full overflow-hidden bg-lightgray flex items-center gap-5"
    >
      <div
        className={`h-full transition-all rounded-full ${status === "warning" ? "bg-warning-popup " : status === "danger" ? "bg-primary-red" : "bg-primary"}`}
        style={{ width: `${progress}%` }}
      />
    </ShadowBox>
  );
};

export default ProgressBar;
