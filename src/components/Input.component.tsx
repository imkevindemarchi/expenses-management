import React, {
  ChangeEvent,
  FC,
  KeyboardEventHandler,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Assets
import {
  DEFAULT_DARK_BORDER_COLOR2,
  DEFAULT_LIGHT_BORDER_COLOR,
} from "../assets/constants";

// Components
import ShadowBox from "./ShadowBox.component";

// Contexts
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

// Spinner
import { ClipLoader as Spinner } from "react-spinners";

// Types
import { TValidation } from "../utils/validation.util";

type TInputType = "text" | "password" | "number";

type TInputAutoComplete = "email" | "current-password";

type TInputMode = "numeric";

interface IProps {
  autoFocus?: boolean;
  placeholder?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  type?: TInputType;
  name?: string;
  value: any;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  autoComplete?: TInputAutoComplete;
  error?: TValidation;
  onSearch?: () => Promise<void>;
  inputMode?: TInputMode;
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  noShadow?: boolean;
}

const Input: FC<IProps> = ({
  type = "text",
  autoFocus = false,
  placeholder,
  startIcon,
  name,
  value,
  onChange,
  className,
  endIcon,
  autoComplete,
  error = { isValid: true },
  onSearch,
  inputMode,
  onKeyUp,
  noShadow = false,
}) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const [isValueChanged, setIsValueChanged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;
  const [borderColor, setBorderColor] = useState<string>(
    isLightMode ? DEFAULT_LIGHT_BORDER_COLOR : DEFAULT_DARK_BORDER_COLOR2,
  );

  function onFocus() {
    setBorderColor("#3Bcc3d");
  }

  function onBlur() {
    setBorderColor(
      isLightMode ? DEFAULT_LIGHT_BORDER_COLOR : DEFAULT_DARK_BORDER_COLOR2,
    );
  }

  useEffect(() => {
    const timeOut: NodeJS.Timeout = setTimeout(async () => {
      if (isValueChanged && onSearch) {
        await onSearch();
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeOut);

    // eslint-disable-next-line
  }, [value]);

  useEffect(() => {
    autoFocus && onFocus();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setBorderColor(
      isLightMode ? DEFAULT_LIGHT_BORDER_COLOR : DEFAULT_DARK_BORDER_COLOR2,
    );
  }, [isLightMode]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <ShadowBox
        ref={inputRef}
        borderColor={!error?.isValid ? "#cc3b3b" : borderColor}
        borderSize={2}
        className={`flex flex-col gap-2 px-5 py-3 border-2 ${isLightMode ? "bg-white" : "bg-black"} ${className}`}
        noShadow={noShadow}
      >
        <div className="flex flex-row gap-2 items-center">
          {startIcon}
          <input
            value={value || ""}
            name={name}
            type={type}
            autoFocus={autoFocus}
            style={{ background: "transparent" }}
            className={`border-none outline-none text-base w-full ${isLightMode ? "text-black" : "text-white"}`}
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(event);
              if (onSearch) {
                setIsValueChanged(true);
                setIsLoading(true);
              }
            }}
            autoComplete={autoComplete}
            inputMode={inputMode}
            onKeyUp={onKeyUp}
          />
          {endIcon}
          {isLoading && <Spinner size={20} color="#ffffff" className="ml-2" />}
        </div>
      </ShadowBox>
      {!error?.isValid && (
        <span className="text-primary-red">{error?.message}</span>
      )}
    </div>
  );
};

export default Input;
