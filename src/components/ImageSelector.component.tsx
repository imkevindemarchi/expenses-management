import React, { ChangeEvent, FC, ReactNode, useRef } from "react";
import { useTranslation } from "react-i18next";

// Assets
import { ImageIcon } from "../assets/icons";

// Components
import LiquidGlass from "./LiquidGlass.component";

// Types
import { TValidation } from "../utils/validation.util";

interface IProps {
  onChange: (file: File) => void;
  error?: TValidation;
}

const ImageSelector: FC<IProps> = ({ onChange, error = { isValid: true } }) => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  function onIconButtonClick(): void {
    if (hiddenFileInput.current) hiddenFileInput.current.click();
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const files: FileList | null = event.target.files;
    files && files.length > 0 && onChange(files[0]);
  }

  const iconButton: ReactNode = (
    <LiquidGlass
      onClick={onIconButtonClick}
      className="w-52 h-52 mobile:w-40 mobile:h-40 flex justify-center items-center flex-col gap-3 cursor-pointer hover:opacity-50"
      borderRadius={100}
    >
      <ImageIcon className="text-white text-[5em] mobile:text-[3em]" />
      <span className="text-white text-sm mobile:text-[0.8em]">
        {t("uploadImage").toUpperCase()}
      </span>
    </LiquidGlass>
  );

  const input: ReactNode = (
    <input
      ref={hiddenFileInput}
      type="file"
      id="file-upload"
      onChange={onInputChange}
      accept="image/jpg"
    />
  );

  return (
    <div className="flex flex-col gap-2">
      {iconButton}
      {input}
      {!error?.isValid && (
        <LiquidGlass
          className="py-2 px-3"
          backgroundColor="rgba(255, 41, 0, 0.3)"
          borderColor="rgba(255, 41, 0, 0.3)"
        >
          <span className="text-white">{error?.message}</span>
        </LiquidGlass>
      )}
    </div>
  );
};

export default ImageSelector;
