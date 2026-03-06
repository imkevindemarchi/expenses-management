import React, { FC, useState } from "react";

// Assets
import { ArrowUpIcon } from "../assets/icons";

// Components
import ShadowBox from "./ShadowBox.component";

const BackToTopButton: FC = () => {
  const [state, setState] = useState(false);

  function checkScroll() {
    if (!state && window.pageYOffset > 20) setState(true);
    else if (state && window.pageYOffset <= 20) setState(false);
  }

  window.addEventListener("scroll", checkScroll);

  return state ? (
    <ShadowBox
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="bg-white p-3 fixed bottom-7 right-7 mobile:bottom-4 mobile:right-4 cursor-pointer hover:opacity-50"
    >
      <ArrowUpIcon className="text-black text-3xl" />
    </ShadowBox>
  ) : null;
};

export default BackToTopButton;
