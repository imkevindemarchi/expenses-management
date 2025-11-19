import React, {
  ChangeEvent,
  FC,
  ReactElement,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

// Components
import LiquidGlass from "./LiquidGlass.component";

// Hooks
import { useClickOutside } from "../hooks";

// Types
import { TValidation } from "../utils/validation.util";

type TInputType = "text" | "password";

type TInputAutoComplete = "email" | "current-password";

export interface IAutocompleteValue {
  id: string | null;
  label: string;
}

interface IProps {
  autoFocus?: boolean;
  placeholder: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  type?: TInputType;
  name?: string;
  value: IAutocompleteValue;
  onChange: (value: IAutocompleteValue) => void;
  className?: string;
  autoComplete?: TInputAutoComplete;
  error?: TValidation;
  data: IAutocompleteValue[];
}

const Autocomplete: FC<IProps> = ({
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
  data,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<boolean>(false);
  const [state, setState] = useState<string | null>(value?.label);

  const hasOptions: boolean = data && data.length > 0;

  const filteredData: IAutocompleteValue[] = data.filter(
    (element: IAutocompleteValue) => {
      return element?.label
        ?.toLowerCase()
        .startsWith(state?.toLowerCase() as string);
    }
  );
  const elabData: IAutocompleteValue[] =
    state && state.trim() !== "" ? filteredData : data;

  function onFocus(): void {
    setDropdown(true);
    if (inputRef.current)
      inputRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  }

  function onBlur(): void {
    if (inputRef.current)
      inputRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  }

  useClickOutside(inputRef as RefObject<HTMLElement>, () => {
    setDropdown(false);
    setState(value?.label);
  });

  useEffect(() => {
    if (value?.label) setState(value?.label);
    else setState(null);
  }, [value]);

  useEffect(() => {
    autoFocus && onFocus();

    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ zIndex: 999 }} className="flex flex-col gap-2 w-full">
      <LiquidGlass
        ref={inputRef}
        className={`flex flex-col gap-2 px-5 py-3 ${className}`}
        zIndex={999}
      >
        <div className="flex flex-row gap-2 items-center relative">
          {startIcon}
          <input
            value={state || ""}
            name={name}
            type={type}
            autoFocus={autoFocus}
            style={{ background: "transparent" }}
            className="border-none outline-none text-base text-white w-full"
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setState(event.target.value)
            }
            autoComplete={autoComplete}
          />
          {endIcon}
          {hasOptions && (
            <div
              style={{ left: "50%", transform: "translate(-50%, 0)" }}
              className={`absolute top-0 transition-all duration-300 opacity-0 pointer-events-none ${
                dropdown && "top-12 opacity-100 pointer-events-auto"
              }`}
            >
              <LiquidGlass
                borderRadius={20}
                backgroundColor="rgba(255, 255, 255, 0.5)"
                className="flex flex-col gap-5 justify-center items-center w-full py-2"
              >
                <div className="flex flex-col gap-2 max-h-60 overflow-y-scroll">
                  {elabData && elabData.length > 0 ? (
                    elabData.map(
                      (element: IAutocompleteValue, index: number) => {
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              onChange(element);
                              setDropdown(false);
                            }}
                            className="cursor-pointer px-5 py-2 hover:opacity-50 transition-all duration-300"
                          >
                            <span className="text-white whitespace-nowrap">
                              {element.label}
                            </span>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <span className="text-white whitespace-nowrap px-5 py-2">
                      {t("noResultFound")}
                    </span>
                  )}
                </div>
              </LiquidGlass>
            </div>
          )}
        </div>
      </LiquidGlass>
      {!error?.isValid && (
        <LiquidGlass
          className="py-2 px-3"
          backgroundColor="rgba(255, 41, 0, 0.3)"
          borderColor="rgba(255, 41, 0, 0.3)"
          zIndex={-1}
        >
          <span className="text-white">{error?.message}</span>
        </LiquidGlass>
      )}
    </div>
  );
};

export default Autocomplete;
