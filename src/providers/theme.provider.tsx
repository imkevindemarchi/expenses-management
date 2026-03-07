import { createContext, JSX, ReactNode, useState } from "react";

// Utils
import { getFromStorage, setToStorage } from "../utils";

interface IProps {
  children: ReactNode;
}

type TState = "light" | "dark";

export type TThemeContext = {
  state: TState;
  stateHandler: () => void;
  isLightMode: boolean;
};

export const ThemeContext = createContext<TThemeContext | null>(null);

export const ThemeProvider = ({ children }: IProps): JSX.Element => {
  const DEFAULT_STATE: TState = getFromStorage("theme");
  const [state, setState] = useState<TState>(DEFAULT_STATE ?? "light");

  function stateHandler(): void {
    const newState: TState = state === "light" ? "dark" : "light";
    setState(newState);
    setToStorage("theme", newState);
  }

  const isLightMode: boolean = state === "light";

  return (
    <ThemeContext.Provider value={{ state, stateHandler, isLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
