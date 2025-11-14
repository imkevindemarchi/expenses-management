import React, { useContext, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";

// Assets
import { ROUTES, TRoute } from "./routes";

// Components
import { Layout } from "./components";

// Contexts
import { AuthContext, TAuthContext } from "./providers/auth.provider";

const App = () => {
  const { isUserAuthenticated }: TAuthContext = useContext(
    AuthContext
  ) as TAuthContext;
  const { pathname } = useLocation();

  const protectedRoute = (route: TRoute) => {
    return route.path === "/log-in" ? (
      route.element
    ) : isUserAuthenticated ? (
      route.element
    ) : (
      <Navigate to="/log-in" replace />
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Layout>
      <Routes>
        {ROUTES.map((route: TRoute, index: number) => {
          return (
            <Route
              key={index}
              path={route.path}
              element={protectedRoute(route)}
            />
          );
        })}
      </Routes>
    </Layout>
  );
};

export default App;
