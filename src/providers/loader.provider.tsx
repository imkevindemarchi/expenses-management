import { createContext, JSX, ReactNode, useState } from "react";

interface IProps {
  children: ReactNode;
}

export type TLoaderContext = {
  state: boolean;
  setState: (value: boolean) => void;
};

export const LoaderContext = createContext<TLoaderContext | null>(null);

export const LoaderProvider = ({ children }: IProps): JSX.Element => {
  const [state, setState] = useState<boolean>(false);

  return (
    <LoaderContext.Provider value={{ state, setState }}>
      {children}
    </LoaderContext.Provider>
  );
};
