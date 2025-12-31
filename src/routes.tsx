import { ReactNode } from "react";

// Pages
import {
  Category,
  Login,
  // Profile,
  PasswordReset,
  Categories,
  SubCategories,
  SubCategory,
  Home,
  Summary,
  Settings,
  YearSummary,
  Expenses,
} from "./pages";

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
    element: <Home />,
    isHidden: true,
  },
  {
    path: "/summary",
    name: "summary",
    element: <Summary />,
  },
  {
    path: "/year-summary",
    name: "year-summary",
    element: <YearSummary />,
  },
  {
    path: "/expenses",
    name: "expenses",
    element: <Expenses />,
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
    path: "/sub-categories",
    name: "sub-categories",
    element: <SubCategories />,
  },
  {
    path: "/sub-categories/new",
    name: "sub-category",
    element: <SubCategory />,
    isHidden: true,
  },
  {
    path: "/sub-categories/edit/:categoryId",
    name: "sub-category",
    element: <SubCategory />,
    isHidden: true,
  },
  {
    path: "/settings",
    name: "settings",
    element: <Settings />,
    isHidden: true,
  },
  // {
  //   path: "/profile",
  //   name: "profile",
  //   element: <Profile />,
  //   isHidden: true,
  // },
  {
    path: "/password-reset",
    name: "password-reset",
    element: <PasswordReset />,
    isHidden: true,
  },
];
