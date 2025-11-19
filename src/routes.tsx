import { ReactNode } from "react";

// Pages
import { Category, Login, Profile, PasswordReset, Categories } from "./pages";

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
  {
    path: "/categories",
    name: "categories",
    element: <Categories />,
  },
  {
    path: "/categories/new",
    name: "category",
    element: <Category />,
    isHidden: true,
  },
  {
    path: "/categories/edit/:categoryId",
    name: "category",
    element: <Category />,
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
    element: <PasswordReset />,
    isHidden: true,
  },
];
