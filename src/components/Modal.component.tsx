import React, { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Assets
import { CloseIcon } from "../assets/icons";

// Components
import Backdrop from "./Backdrop.component";
import LiquidGlass from "./LiquidGlass.component";
import Button from "./Button.component";

interface IProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onCancel?: () => void;
  cancelButtonText?: string;
  submitButtonText?: string;
  onSubmit?: () => void;
  onClose?: () => void;
}

const Modal: FC<IProps> = ({
  isOpen,
  title,
  children,
  onCancel,
  cancelButtonText = "cancel",
  submitButtonText = "save",
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const isMobile: boolean = window.matchMedia("(max-width: 768px)").matches;

  const header = (
    <div className="w-full flex justify-between items-center">
      <span className="text-white text-2xl font-bold uppercase">{title}</span>
      <LiquidGlass
        onClick={onClose ?? onCancel}
        className="w-10 h-10 flex justify-center items-center cursor-pointer hover:opacity-50"
      >
        <CloseIcon className="text-white text-2xl" />
      </LiquidGlass>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <div className="flex items-center gap-5">
        {onCancel && (
          <Button
            text={t(cancelButtonText)}
            variant="liquid-glass"
            onClick={onCancel}
          />
        )}
        {onSubmit && (
          <Button
            text={t(submitButtonText)}
            variant="liquid-glass"
            onClick={onSubmit}
          />
        )}
      </div>
    </div>
  );

  return isOpen ? (
    <Backdrop>
      <LiquidGlass
        blur={50}
        borderRadius={isMobile ? 20 : 50}
        className="absolute p-10 flex flex-col gap-5 min-w-[35%] mobile:max-w-[90%] mobile:p-5"
      >
        {header}
        {children}
        {footer}
      </LiquidGlass>
    </Backdrop>
  ) : null;
};

export default Modal;
