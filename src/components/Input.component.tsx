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
import LiquidGlass from "./LiquidGlass.component";

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
}) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const [isValueChanged, setIsValueChanged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function onFocus() {
    if (inputRef.current)
      inputRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  }

  function onBlur() {
    if (inputRef.current)
      inputRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
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
      <LiquidGlass
        ref={inputRef}
        className={`flex flex-col gap-2 px-5 py-3 ${className}`}
      >
        <div className="flex flex-row gap-2 items-center">
          {startIcon}
          <input
            value={value || ""}
            name={name}
            type={type}
            autoFocus={autoFocus}
            style={{ background: "transparent" }}
            className="border-none outline-none text-base text-white w-full"
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
      </LiquidGlass>
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

export default Input;
