import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { HouseholdProvider } from "./context/HouseholdContext";
import { GroceryProvider } from "./context/GroceryContext";
import { ChoreProvider } from "./context/ChoreContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HouseholdProvider>
          <GroceryProvider>
            <ChoreProvider>
            <ExpenseProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
            </ExpenseProvider>
            </ChoreProvider>
          </GroceryProvider>
        </HouseholdProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
