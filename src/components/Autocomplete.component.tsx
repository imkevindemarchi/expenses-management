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

// Hooks
import { useClickOutside } from "../hooks";

// Types
import { TValidation } from "../utils/validation.util";
import { Z_INDEX } from "../assets/constants";
import ShadowBox from "./ShadowBox.component";

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
  const [borderColor, setBorderColor] = useState<string>("rgba(0, 0, 0, 0.04)");

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

  function onBlur(): void {
    setBorderColor("rgba(0, 0, 0, 0.04)");
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

  return (
    <div className="flex flex-col gap-2 w-full">
      <ShadowBox
        ref={inputRef}
        borderColor={borderColor}
        borderSize={2}
        zIndex={zIndex ?? Z_INDEX.AUTOCOMPLETE}
        className={`flex flex-col gap-2 px-5 py-3 border-2 border-white bg-white ${className}`}
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
            className={`border-none outline-none text-base text-black w-full ${alignTextToCenter ? "text-center" : ""}`}
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
              style={{ left: "50%", transform: "translate(-50%, 0)" }}
              borderRadius={50}
              className={`absolute text-center top-0 transition-all duration-300 opacity-0 pointer-events-none flex flex-col gap-5 justify-center items-center py-2 z-800 min-w-40 overflow-y-scroll bg-white ${
                dropdown && "top-12 opacity-100 pointer-events-auto"
              } ${noFullOptionsWidth ? "w-96 text-center" : "w-full"}`}
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
                        className={`cursor-pointer w-full px-5 py-2 hover:opacity-50 transition-all duration-300 rounded-full ${isSelected ? "bg-lightgray" : ""}`}
                      >
                        <span
                          className={`whitespace-nowrap ${isSelected ? "text-primary" : "text-black"}`}
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
        <ShadowBox className="py-2 px-3">
          <span className="text-white">{error?.message}</span>
        </ShadowBox>
      )}
    </div>
  );
};

export default Autocomplete;
