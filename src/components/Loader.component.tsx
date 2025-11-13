import React, { FC, useContext } from "react";
import { useTranslation } from "react-i18next";

// Assets
import logoImg from "../assets/images/logo.png";

// Components
import Backdrop from "./Backdrop.component";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";

const Loader: FC = () => {
  const { state: isLoading }: TLoaderContext = useContext(
    LoaderContext
  ) as TLoaderContext;
  const { t } = useTranslation();

  return isLoading ? (
    <Backdrop>
      <img
        src={logoImg}
        alt={t("imgNotFound")}
        className="w-60 mobile:w-40"
        style={{ animation: "animateLogo  linear 1s infinite alternate" }}
      />
    </Backdrop>
  ) : (
    <></>
  );
};

export default Loader;
