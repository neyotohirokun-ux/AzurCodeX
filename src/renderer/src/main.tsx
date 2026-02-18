import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";

import App from "./App";
import { Navigation } from "./components/Navigation";
import { NavigationProvider } from "./components/NavigationContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <NavigationProvider>
        <Navigation />
        <App />
      </NavigationProvider>
    </HashRouter>
  </StrictMode>,
);
