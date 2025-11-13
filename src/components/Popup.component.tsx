import React, { FC, useContext } from "react";

// Assets
import { CheckIcon, CloseIcon, ErrorIcon, WarningIcon } from "../assets/icons";

// Components
import LiquidGlass from "./LiquidGlass.component";

// Contexts
import { PopupContext, TPopupContext } from "../providers/popup.provider";

const Popup: FC = () => {
  const { state, onClose }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const { message, isOpen, type } = state;

  const isSuccess: boolean = type === "success";
  const isError: boolean = type === "error";
  const isWarning: boolean = type === "warning";

  return (
    <LiquidGlass
      zIndex={100}
      className={`fixed top-10 ${
        isOpen ? "right-5 opacity-100" : "-right-96 opacity-0"
      }`}
      noBorder
      blur={2}
    >
      <div
        style={{
          backgroundColor: isSuccess
            ? `rgb(0, 128, 0, 0.6)`
            : isWarning
            ? "rgb(255, 165, 0, 0.6)"
            : isError
            ? "rgb(255, 0, 0, 0.6)"
            : "",
        }}
        className="px-5 py-2 rounded-full flex items-center gap-2"
      >
        {isSuccess && <CheckIcon className="text-2xl text-white" />}
        {isWarning && <WarningIcon className="text-2xl text-white" />}
        {isError && <ErrorIcon className="text-2xl text-white" />}
        <span className="text-base text-white">{message}</span>
        <CloseIcon
          className="text-2xl text-white cursor-pointer"
          onClick={onClose}
        />
      </div>
    </LiquidGlass>
  );
};

export default Popup;
