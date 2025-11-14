import { ReactNode } from "react";

// Pages
import { Login } from "./pages";

export type TRoute = {
  path: string;
  name: string;
  element: ReactNode;
  isHidden?: boolean;
};

export const ROUTES: TRoute[] = [
  {
    path: "/log-in",
    name: "login",
    element: <Login />,
    isHidden: true,
  },
  {
    path: "/",
    name: "",
    element: <></>,
    isHidden: true,
  },
  {
    path: "/summary",
    name: "summary",
    element: <></>,
  },
  {
    path: "/reports",
    name: "reports",
    element: <></>,
  },
  {
    path: "/graphs",
    name: "graphs",
    element: <></>,
  },
];
