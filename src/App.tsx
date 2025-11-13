import React, { ReactNode, useContext } from "react";
import { Navigate, Route, Routes } from "react-router";

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

  const routeElement = (route: TRoute): ReactNode =>
    route.path === "/log-in" && isUserAuthenticated ? (
      <Navigate to="/admin" replace />
    ) : (
      route.element
    );

  return (
    <Layout>
      <Routes>
        {ROUTES.map((route: TRoute, index: number) => {
          return (
            <Route
              key={index}
              path={route.path}
              element={routeElement(route)}
            />
          );
        })}
      </Routes>
    </Layout>
  );
};

export default App;
