import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

// Assets
import "./index.css";
import "./i18n.ts";

// Components
import App from "./App";

// Providers
import {
  AuthProvider,
  LoaderProvider,
  PopupProvider,
  SidebarProvider,
} from "./providers";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const app = (
  <BrowserRouter>
    <LoaderProvider>
      <AuthProvider>
        <PopupProvider>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </PopupProvider>
      </AuthProvider>
    </LoaderProvider>
  </BrowserRouter>
);

root.render(app);
