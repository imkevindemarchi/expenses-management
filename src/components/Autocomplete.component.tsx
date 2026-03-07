import React, {
  ChangeEvent,
  FC,
  ReactElement,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

// Assets
import {
  DEFAULT_DARK_BORDER_COLOR,
  DEFAULT_DARK_BORDER_COLOR2,
  DEFAULT_LIGHT_BORDER_COLOR,
  Z_INDEX,
} from "../assets/constants";

// Components
import ShadowBox from "./ShadowBox.component";

// Contexts
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

// Hooks
import { useClickOutside } from "../hooks";

// Types
import { TValidation } from "../utils/validation.util";

type TInputType = "text" | "password";

type TInputAutoComplete = "email" | "current-password";

export interface IAutocompleteValue {
  id: string | number | null;
  label: string;
}

interface IProps {
  autoFocus?: boolean;
  placeholder?: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  type?: TInputType;
  name?: string;
  value: IAutocompleteValue | undefined;
  onChange: (value: IAutocompleteValue) => void;
  className?: string;
  autoComplete?: TInputAutoComplete;
  error?: TValidation;
  data: IAutocompleteValue[];
  showAllOptions?: boolean;
  noFullOptionsWidth?: boolean;
  alignTextToCenter?: boolean;
  noShadow?: boolean;
  zIndex?: number;
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
  showAllOptions,
  noFullOptionsWidth = false,
  alignTextToCenter = false,
  noShadow = false,
  zIndex,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<boolean>(false);
  const [state, setState] = useState<string | undefined>(value?.label);
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;
  const [borderColor, setBorderColor] = useState<string>(
    isLightMode ? DEFAULT_LIGHT_BORDER_COLOR : DEFAULT_DARK_BORDER_COLOR,
  );

  const hasOptions: boolean = data && data.length > 0;

  const filteredData: IAutocompleteValue[] = data.filter(
    (element: IAutocompleteValue) => {
      return element?.label
        ?.toLowerCase()
        .startsWith(state?.toLowerCase() as string);
    },
  );
  const elabData: IAutocompleteValue[] =
    state && state.trim() !== "" && !showAllOptions ? filteredData : data;

  function onFocus(): void {
    setDropdown(true);
    setBorderColor("#3Bcc3d");
  }

  function onBlur() {
    setBorderColor(
      isLightMode ? DEFAULT_LIGHT_BORDER_COLOR : DEFAULT_DARK_BORDER_COLOR,
    );
  }

  useClickOutside(inputRef as RefObject<HTMLElement>, () => {
    setDropdown(false);
    setState(value?.label);
  });

  useEffect(() => {
    if (value?.label) setState(value?.label);
    else setState(undefined);
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
        zIndex={zIndex ?? Z_INDEX.AUTOCOMPLETE}
        className={`flex flex-col gap-2 px-5 py-3 border-2 ${isLightMode ? "bg-white" : "bg-black"} ${className}`}
        noShadow={noShadow}
      >
        <div className="flex flex-row gap-2 items-center relative">
          {startIcon}
          <input
            value={state || ""}
            name={name}
            type={type}
            autoFocus={autoFocus}
            style={{ background: "transparent" }}
            className={`border-none outline-none text-base w-full ${isLightMode ? "text-black" : "text-white"} ${alignTextToCenter ? "text-center" : ""}`}
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
            <ShadowBox
              borderColor={
                isLightMode
                  ? DEFAULT_LIGHT_BORDER_COLOR
                  : DEFAULT_DARK_BORDER_COLOR2
              }
              style={{ left: "50%", transform: "translate(-50%, 0)" }}
              borderRadius={50}
              className={`absolute text-center top-0 transition-all duration-300 opacity-0 pointer-events-none flex flex-col gap-5 justify-center items-center py-2 z-800 min-w-40 overflow-y-scroll ${
                dropdown && "top-12 opacity-100 pointer-events-auto"
              } ${noFullOptionsWidth ? "w-96 text-center" : "w-full"} ${isLightMode ? "bg-white" : "bg-black"}`}
            >
              <div className="flex flex-col max-h-60 w-full px-5 py-2">
                {elabData && elabData.length > 0 ? (
                  elabData.map((element: IAutocompleteValue, index: number) => {
                    const isSelected: boolean = element.label === state;

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          onChange(element);
                          setDropdown(false);
                        }}
                        className={`cursor-pointer w-full px-5 py-2 hover:opacity-50 transition-all duration-300 rounded-full ${isSelected && isLightMode ? "bg-lightgray" : isSelected ? "bg-darkgray2" : ""}`}
                      >
                        <span
                          className={`whitespace-nowrap ${isSelected ? "text-primary" : isLightMode ? "text-black" : "text-white"}`}
                        >
                          {element.label}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-white whitespace-nowrap px-5 py-2">
                    {t("noResultFound")}
                  </span>
                )}
              </div>
            </ShadowBox>
          )}
        </div>
      </ShadowBox>
      {!error?.isValid && (
        <span className="text-primary-red">{error?.message}</span>
      )}
    </div>
  );
};

export default Autocomplete;
