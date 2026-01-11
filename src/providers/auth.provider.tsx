import {
  createContext,
  JSX,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { NavigateFunction, useNavigate } from "react-router";

// Api
import { AUTH_API } from "../api";

// Contexts
import { LoaderContext, TLoaderContext } from "./loader.provider";

// Types
import { THTTPResponse, TProfile } from "../types";

// Utils
import { getFromStorage, removeFromStorage, setToStorage } from "../utils";

interface IProps {
  children: ReactNode;
}

export type TAuthContext = {
  isUserAuthenticated: boolean;
  setIsUserAuthenticated: (value: boolean) => void;
  userData: TProfile | null;
};

export const AuthContext = createContext<TAuthContext | null>(null);

export const AuthProvider = ({ children }: IProps): JSX.Element => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(
    getFromStorage("token") ? true : false
  );
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext
  ) as TLoaderContext;
  const [userData, setUserData] = useState<TProfile | null>(null);

  const navigate: NavigateFunction = useNavigate();

  function onLogout(): void {
    navigate("/log-in");
    removeFromStorage("token");
    setIsUserAuthenticated(false);
  }

  async function onLoad() {
    setIsLoading(true);

    try {
      await Promise.resolve(AUTH_API.checkSession()).then(
        (response: THTTPResponse) => {
          if (response.hasSuccess) {
            setToStorage("token", response.data?.access_token);
            setIsUserAuthenticated(true);
            setUserData({
              ...response.data?.user?.user_metadata,
              id: response.data?.user?.id,
              email: response.data?.user?.email,
            });
          } else onLogout();
        }
      );
    } catch (error) {
      console.error("🚀 ~ error:", error);
      onLogout();
    }

    setIsLoading(false);
  }

  useEffect(() => {
    onLoad();

    // eslint-disable-next-line
  }, [isUserAuthenticated]);

  return (
    <AuthContext.Provider
      value={{ isUserAuthenticated, setIsUserAuthenticated, userData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
