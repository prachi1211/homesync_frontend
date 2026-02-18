import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { HouseholdProvider } from "./context/HouseholdContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HouseholdProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </HouseholdProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
