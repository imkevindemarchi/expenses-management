import React, { FC } from "react";
import { useNavigate } from "react-router";

// Assets
import { ArrowLeftIcon } from "../assets/icons";

// Components
import LiquidGlass from "./LiquidGlass.component";

interface IProps {
  onClick?: Function;
}

const GoBackButton: FC<IProps> = ({ onClick }) => {
  const navigate = useNavigate();

  function onGoBack(): void {
    navigate(-1);
  }

  return (
    <LiquidGlass
      borderRadius={100}
      className="w-10 h-10 flex justify-center items-center "
    >
      <button type="button" onClick={() => (onClick ? onClick() : onGoBack())}>
        <ArrowLeftIcon className="text-white text-2xl" />
      </button>
    </LiquidGlass>
  );
};

export default GoBackButton;
