import React, { FC, useContext } from "react";

// Assets
import { CheckIcon, CloseIcon, ErrorIcon, WarningIcon } from "../assets/icons";
import { Z_INDEX } from "../assets/constants";

// Components
import ShadowBox from "./ShadowBox.component";

// Contexts
import { PopupContext, TPopupContext } from "../providers/popup.provider";

const Popup: FC = () => {
  const { state, onClose }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const { message, isOpen, type } = state;

  const isSuccess: boolean = type === "success";
  const isError: boolean = type === "error";
  const isWarning: boolean = type === "warning";

  return (
    <ShadowBox
      className={`fixed top-5 max-w-[70%] ${
        isOpen ? "right-5 opacity-100" : "-right-96 opacity-0"
      }`}
      zIndex={Z_INDEX.POPUP}
    >
      <div
        className={`px-5 py-2 rounded-full flex items-center gap-2 ${isSuccess ? "bg-success-popup" : isWarning ? "bg-warning-popup" : "bg-error-popup"}`}
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
    </ShadowBox>
  );
};

export default Popup;
