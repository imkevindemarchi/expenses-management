import React, { FC, useContext } from "react";

// Components
import Backdrop from "./Backdrop.component";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";

// Icons
import { EuroIcon } from "../assets/icons";

const Loader: FC = () => {
  const { state: isLoading }: TLoaderContext = useContext(
    LoaderContext,
  ) as TLoaderContext;

  return isLoading ? (
    <Backdrop noBackground>
      <EuroIcon
        className="text-[20em] mobile:text-[10em] text-primary"
        style={{ animation: "animateLogo  linear 1s infinite alternate" }}
      />
    </Backdrop>
  ) : (
    <></>
  );
};

export default Loader;
