import React, { FC, useContext, useState } from "react";

// Assets
import { ArrowUpIcon } from "../assets/icons";

// Components
import ShadowBox from "./ShadowBox.component";

// Contexts
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

const BackToTopButton: FC = () => {
  const [state, setState] = useState(false);
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  function checkScroll() {
    if (!state && window.pageYOffset > 20) setState(true);
    else if (state && window.pageYOffset <= 20) setState(false);
  }

  window.addEventListener("scroll", checkScroll);

  return state ? (
    <ShadowBox
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`p-3 fixed bottom-7 right-7 mobile:bottom-4 mobile:right-4 cursor-pointer hover:opacity-50 ${isLightMode ? "bg-white" : "bg-black"}`}
    >
      <ArrowUpIcon
        className={`text-black text-3xl transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
      />
    </ShadowBox>
  ) : null;
};

export default BackToTopButton;
