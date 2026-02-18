import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useHousehold } from "../../hooks/useHousehold";

const ONBOARDING_EXEMPT = ["/onboarding", "/join"];

export function ProtectedRoute() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { households, isLoading: householdLoading } = useHousehold();
  const location = useLocation();

  if (authLoading || (isAuthenticated && householdLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <svg className="animate-spin-slow h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-charcoal-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isExempt = ONBOARDING_EXEMPT.some((p) => location.pathname.startsWith(p));

  if (!isExempt && households.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
