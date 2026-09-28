import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useHousehold } from "../../hooks/useHousehold";
import { Logo } from "../ui/Logo";

const ONBOARDING_EXEMPT = ["/onboarding", "/join"];

function Splash() {
  // A sleeping server can take a while to answer the first request — say so instead of spinning silently
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-cream px-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <Logo size="md" />
        <div className="h-[3px] w-40 overflow-hidden rounded-full bg-primary/10" aria-hidden="true">
          <div className="h-full w-1/3 rounded-full bg-primary animate-[splash-bar_1.1s_var(--ease-in-out)_infinite]" />
        </div>
        <p className="text-sm text-charcoal-muted text-center max-w-[16rem] min-h-10">
          {slow ? "Waking up the server — the first load can take up to a minute." : <span className="sr-only">Loading your household</span>}
        </p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { households, householdsError, isLoading: householdLoading } = useHousehold();
  const location = useLocation();

  if (authLoading || (isAuthenticated && householdLoading)) {
    return <Splash />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isExempt = ONBOARDING_EXEMPT.some((p) => location.pathname.startsWith(p));

  // Only redirect to onboarding when we're sure there are no households.
  // Don't redirect if the load failed (backend down) — let the page show its own error state.
  if (!isExempt && !householdsError && households.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
