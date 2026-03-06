import React, { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Assets
import { CloseIcon, SaveIcon } from "../assets/icons";

// Components
import Backdrop from "./Backdrop.component";
import Button from "./Button.component";
import ShadowBox from "./ShadowBox.component";

interface IProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onCancel?: () => void;
  cancelButtonText?: string;
  submitButtonText?: string;
  onSubmit?: () => void;
  onClose?: () => void;
  className?: string;
  hideSubmitIcon?: boolean;
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
  className,
  hideSubmitIcon = false,
}) => {
  const { t } = useTranslation();
  const isMobile: boolean = window.matchMedia("(max-width: 768px)").matches;

  const header = (
    <div className="w-full flex justify-between items-center mobile:gap-5">
      <span className="text-black text-2xl">{title}</span>
      <div
        onClick={onClose ?? onCancel}
        className="flex items-center justify-center p-2 bg-lightgray rounded-full cursor-pointer hover:opacity-50 transition-all duration-300"
      >
        <CloseIcon className="text-darkgray text-2xl" />
      </div>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <div className="flex items-center gap-5">
        {onCancel && (
          <Button
            text={t(cancelButtonText)}
            onClick={onCancel}
            variant="secondary"
            className="bg-gray"
          />
        )}
        {onSubmit && (
          <Button
            text={t(submitButtonText)}
            onClick={onSubmit}
            className="bg-primary"
            icon={
              !hideSubmitIcon && <SaveIcon className="text-white text-xl" />
            }
          />
        )}
      </div>
    </div>
  );

  return isOpen ? (
    <Backdrop>
      <ShadowBox
        borderRadius={isMobile ? 20 : 50}
        className={`absolute p-10 flex flex-col gap-5 min-w-[30%] mobile:max-w-[95%] mobile:p-5 bg-white ${className}`}
      >
        {header}
        {children}
        {footer}
      </ShadowBox>
    </Backdrop>
  ) : null;
};

export default Modal;
