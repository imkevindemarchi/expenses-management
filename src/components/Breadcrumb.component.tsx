import React from "react";
import { useTranslation } from "react-i18next";
import { NavigateFunction, useLocation, useNavigate } from "react-router";

// Assets
import { ArrowRightIcon } from "../assets/icons";

// Components
import LiquidGlass from "./LiquidGlass.component";

const Breadcrumb = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate: NavigateFunction = useNavigate();

  const splittedPathname = pathname.split("/").slice(1);
  const hasEdit: boolean = splittedPathname.find(
    (path: string) => path === "edit"
  )
    ? true
    : false;
  hasEdit && splittedPathname.pop();

  let paths: string[] = pathname.split("/");
  paths.pop();
  hasEdit && paths.pop();

  const previousPage: string = paths.join("/");

  function onGoToPreviousPage(): void {
    navigate(previousPage);
  }

  return splittedPathname.length > 1 ? (
    <div className="flex items-center w-fit gap-3">
      {splittedPathname.map((path: string, index: number) => {
        const isLastElement: boolean = index === splittedPathname.length - 1;

        return isLastElement ? (
          <LiquidGlass key={index} className="px-5 h-full">
            <span key={index} className="text-white">
              {t(path)}
            </span>
          </LiquidGlass>
        ) : (
          <div key={index} className="flex flex-row items-center gap-3">
            <span
              onClick={onGoToPreviousPage}
              className="transition-all duration-300 hover:underline cursor-pointer text-white opacity-80"
            >
              {t(path)}
            </span>
            <ArrowRightIcon className="text-white" />
          </div>
        );
      })}
    </div>
  ) : (
    <></>
  );
};

export default Breadcrumb;
