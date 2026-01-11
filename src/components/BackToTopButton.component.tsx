import React, { FC, useContext, useState } from "react";

// Assets
import { ArrowUpIcon } from "../assets/icons";

// Components
import LiquidGlass from "./LiquidGlass.component";

// Contexts
import { SidebarContext, TSidebarContext } from "../providers/sidebar.provider";

const BackToTopButton: FC = () => {
  const [state, setState] = useState(false);
  const { isOpen: isSidebarOpen }: TSidebarContext = useContext(
    SidebarContext
  ) as TSidebarContext;

  function checkScroll() {
    if (!state && window.pageYOffset > 20) setState(true);
    else if (state && window.pageYOffset <= 20) setState(false);
  }

  window.addEventListener("scroll", checkScroll);

  return (
    <LiquidGlass
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        zIndex: state && !isSidebarOpen ? 100 : -900,
      }}
      className="p-3 fixed bottom-7 right-7 mobile:bottom-4 mobile:right-4 cursor-pointer hover:opacity-50"
    >
      <ArrowUpIcon className="text-white text-3xl" />
    </LiquidGlass>
  );
};

export default BackToTopButton;
