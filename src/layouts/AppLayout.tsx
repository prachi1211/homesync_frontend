import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { Logo } from "../components/ui/Logo";
import { HouseholdSelector } from "../components/household/HouseholdSelector";

function UserMenu() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function getInitials() {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
    addToast("info", "Signed out", "You've been logged out.");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm hover:bg-primary-light/70 transition-colors"
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {getInitials()}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-charcoal-muted/10 py-1 z-40 animate-slide-up">
          <div className="px-3 py-2 border-b border-charcoal-muted/10">
            <p className="text-xs font-medium text-charcoal truncate">{user?.name}</p>
            <p className="text-xs text-charcoal-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); navigate("/settings"); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal-light hover:bg-cream hover:text-charcoal transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal-light hover:bg-cream hover:text-charcoal transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-charcoal-muted/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Logo size="sm" />

          {/* Center: household selector (hidden on very small screens) */}
          <div className="hidden sm:flex flex-1 justify-center">
            <HouseholdSelector />
          </div>

          <UserMenu />
        </div>

        {/* Mobile: household selector below header bar */}
        <div className="sm:hidden flex justify-center pb-2 px-4">
          <HouseholdSelector />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
