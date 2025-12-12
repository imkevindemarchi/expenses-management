import React, { FC } from "react";

// Components
import LiquidGlass from "./LiquidGlass.component";

interface IProps {
  progress: number;
}

const ProgressBar: FC<IProps> = ({ progress }) => {
  return (
    <LiquidGlass className="w-[300px] h-4 rounded-full overflow-hidden">
      <div
        className="h-full bg-white transition-all"
        style={{ width: `${progress}%` }}
      />
    </LiquidGlass>
  );
};

export default ProgressBar;
