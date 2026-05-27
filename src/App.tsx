import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useHousehold } from "./hooks/useHousehold";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OnboardingPage } from "./pages/household/OnboardingPage";
import { JoinPage } from "./pages/household/JoinPage";
import { HouseholdSettingsPage } from "./pages/household/HouseholdSettingsPage";
import { GroceryPage } from "./pages/grocery/GroceryPage";
import { ChoresPage } from "./pages/chores/ChoresPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import { LandingPage } from "./pages/LandingPage";

function RootRedirect() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { households, isLoading: householdLoading } = useHousehold();

  if (authLoading || (isAuthenticated && householdLoading)) return null;

  if (!isAuthenticated) return <LandingPage />;
  if (households.length === 0) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected — no AppLayout (full-page flows) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/join" element={<JoinPage />} />
      </Route>

      {/* Protected — with AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/groceries" element={<GroceryPage />} />
          <Route path="/chores" element={<ChoresPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/household/settings" element={<HouseholdSettingsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
