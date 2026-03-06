import React, {
  ChangeEvent,
  FC,
  KeyboardEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

// Components
import ShadowBox from "./ShadowBox.component";

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
  const [borderColor, setBorderColor] = useState<string>("rgba(0, 0, 0, 0.04)");

  function onFocus() {
    setBorderColor("#3Bcc3d");
  }

  function onBlur() {
    setBorderColor("rgba(0, 0, 0, 0.04)");
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

  return (
    <div className="flex flex-col gap-2 w-full">
      <ShadowBox
        ref={inputRef}
        borderColor={borderColor}
        borderSize={2}
        className={`flex flex-col gap-2 px-5 py-3 border-2 border-white ${className}`}
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
            className="border-none outline-none text-base text-black w-full"
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
        <ShadowBox className="py-2 px-3">
          <span className="text-white">{error?.message}</span>
        </ShadowBox>
      )}
    </div>
  );
};

export default Input;
