import { ReactNode } from "react";

// Pages
import { Login, Profile, ResetPassword } from "./pages";

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
    path: "/profile",
    name: "profile",
    element: <Profile />,
    isHidden: true,
  },
  {
    path: "/password-reset",
    name: "password-reset",
    element: <ResetPassword />,
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
