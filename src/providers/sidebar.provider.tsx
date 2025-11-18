import { createContext, JSX, ReactNode, useState } from "react";

interface IProps {
  children: ReactNode;
}

export type TSidebarContext = {
  isOpen: boolean;
  onStateChange: () => void;
};

export const SidebarContext = createContext<TSidebarContext | null>(null);

export const SidebarProvider = ({ children }: IProps): JSX.Element => {
  const [state, setState] = useState<boolean>(false);

  const isOpen: boolean = state;

  function onStateChange(): void {
    setState(!state);
  }

  return (
    <SidebarContext.Provider value={{ isOpen, onStateChange }}>
      {children}
    </SidebarContext.Provider>
  );
};
