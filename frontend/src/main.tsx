import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import "./styles/theme.css"
import { EventSetupProvider } from "./context/EventSetupContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <EventSetupProvider>
        <App />
      </EventSetupProvider>
    </BrowserRouter>
  </React.StrictMode>
);
