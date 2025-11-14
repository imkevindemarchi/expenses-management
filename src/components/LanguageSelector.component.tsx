import React, { FC, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";

// Components
import LiquidGlass from "./LiquidGlass.component";

// Hooks
import { useClickOutside } from "../hooks";

interface IProps {
  value: string;
  onChange: (countryCode: string) => void;
}

type TLanguage = {
  id: string;
  label: string;
};

const LANGUAGES: TLanguage[] = [
  { id: "it", label: "italian" },
  { id: "en", label: "english" },
];

const LanguageSelector: FC<IProps> = ({ value, onChange }) => {
  const [state, setState] = useState<boolean>(false);
  const ref: any | null = useRef(null);
  const {
    t,
    i18n: { language: currentLanguage },
  } = useTranslation();

  const elabValue: string = value === "en" ? "gb" : value;

  useClickOutside(ref, () => setState(false));

  return (
    <div ref={ref} className="relative">
      <LiquidGlass
        onClick={() => setState(!state)}
        className="w-10 h-10 flex justify-center items-center hover:opacity-50 cursor-pointer"
      >
        <ReactCountryFlag
          countryCode={elabValue}
          svg
          style={{
            width: "1.5em",
            height: "1.5em",
          }}
        />
      </LiquidGlass>
      <div
        style={{ left: "50%", transform: "translate(-50%, 0)" }}
        className={`absolute top-0 transition-all duration-300 opacity-0 pointer-events-none ${
          state && "top-12 opacity-100 pointer-events-auto"
        }`}
      >
        <LiquidGlass
          borderRadius={30}
          className="flex flex-col gap-5 justify-center items-center w-40 py-5"
        >
          {LANGUAGES.map((language: TLanguage, index: number) => {
            const countryCode: string =
              language.id === "en" ? "gb" : language.id;
            const isSelectedLanguage: boolean = language.id === currentLanguage;

            return isSelectedLanguage ? (
              <LiquidGlass
                key={index}
                className="flex items-center gap-2 px-5 py-2"
              >
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{
                    width: "1.5em",
                    height: "1.5em",
                  }}
                />
                <span className="text-white">{t(language.label)}</span>
              </LiquidGlass>
            ) : (
              <div
                key={index}
                onClick={() => onChange(language.id)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-50 transition-all duration-300"
              >
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{
                    width: "1.5em",
                    height: "1.5em",
                  }}
                />
                <span className="text-white">{t(language.label)}</span>
              </div>
            );
          })}
        </LiquidGlass>
      </div>
    </div>
  );
};

export default LanguageSelector;
