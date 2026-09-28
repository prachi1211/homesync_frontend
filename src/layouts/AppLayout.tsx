import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, CheckSquare, CreditCard, BarChart2,
  Settings, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { Logo } from "../components/ui/Logo";
import { HouseholdSelector } from "../components/household/HouseholdSelector";
import { cn } from "../utils/cn";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home",       Icon: LayoutDashboard },
  { to: "/groceries", label: "Groceries",  Icon: ShoppingBag },
  { to: "/chores",    label: "Chores",     Icon: CheckSquare },
  { to: "/expenses",  label: "Expenses",   Icon: CreditCard },
  { to: "/analytics", label: "Analytics",  Icon: BarChart2 },
];

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function useSignOut() {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate("/login", { replace: true });
    addToast("info", "Signed out");
  };
}

// ── User menu (top bar) ───────────────────────────────────────────────────────

function UserMenu() {
  const { user } = useAuth();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full sm:rounded-xl p-0.5 sm:pl-1 sm:pr-2 sm:py-1 hover:bg-cream-dark transition-colors"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center font-semibold text-xs tracking-wide">
          {getInitials(user?.name)}
        </span>
        <span className="hidden sm:block text-sm font-medium text-charcoal max-w-[140px] truncate">
          {user?.name ?? "Account"}
        </span>
        <ChevronDown
          size={14}
          className={cn("text-charcoal-muted hidden sm:block transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-lg border border-line p-1.5 z-10 origin-top-right animate-pop-in"
        >
          <div className="px-3 py-2.5 mb-1 border-b border-line">
            <p className="text-sm font-semibold text-charcoal truncate">{user?.name}</p>
            <p className="text-xs text-charcoal-muted truncate">{user?.email}</p>
          </div>
          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate("/settings"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-charcoal-light hover:bg-cream hover:text-charcoal transition-colors"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            role="menuitem"
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-error-light transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

const sideLink = (collapsed: boolean) => ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative flex items-center h-10 rounded-xl text-sm font-medium transition-colors",
    collapsed ? "justify-center" : "gap-3 px-3",
    isActive
      ? "bg-white/[0.1] text-white before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-[3px] before:rounded-r-full before:bg-[#9fd8b8]"
      : "text-sidebar-ink/70 hover:bg-white/[0.06] hover:text-white"
  );

function SidebarUserSection({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  const signOut = useSignOut();

  return (
    <div className={cn("flex items-center mt-2 pt-3 border-t border-white/[0.08]", collapsed ? "flex-col gap-2" : "gap-3 px-2")}>
      <span className="w-8 h-8 rounded-full bg-white/[0.12] text-white grid place-items-center font-semibold text-xs shrink-0">
        {getInitials(user?.name)}
      </span>
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name ?? "Account"}</p>
          <p className="text-xs text-sidebar-ink/55 truncate">{user?.email}</p>
        </div>
      )}
      <button
        onClick={signOut}
        title="Sign out"
        aria-label="Sign out"
        className="shrink-0 h-8 w-8 grid place-items-center rounded-lg text-sidebar-ink/60 hover:text-white hover:bg-white/[0.08] transition-colors"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

// ── App layout ────────────────────────────────────────────────────────────────

export function AppLayout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar_collapsed") === "true"
  );

  // New page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  function toggleSidebar() {
    setCollapsed((v) => {
      localStorage.setItem("sidebar_collapsed", String(!v));
      return !v;
    });
  }

  return (
    <div className="min-h-dvh bg-cream flex">

      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 flex-col z-40 bg-sidebar",
          "transition-[width] duration-200 ease-out",
          collapsed ? "w-[68px]" : "w-60"
        )}
      >
        <div className={cn("h-16 flex items-center shrink-0", collapsed ? "justify-center" : "px-5")}>
          {collapsed ? (
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none" aria-label="HomeSync">
              <path d="M20 4L4 18H9V34H17V24H23V34H31V18H36L20 4Z" fill="#fff" />
              <rect x="26" y="8" width="4" height="8" rx="1" fill="rgba(255,255,255,0.65)" />
            </svg>
          ) : (
            <Logo size="sm" light />
          )}
        </div>

        <nav aria-label="Main" className={cn("flex-1 pt-3 space-y-1 overflow-y-auto", collapsed ? "px-2.5" : "px-3")}>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} title={collapsed ? label : undefined} className={sideLink(collapsed)}>
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.1 : 1.8} />
                  {!collapsed && label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cn("pb-4 pt-2 space-y-1", collapsed ? "px-2.5" : "px-3")}>
          <NavLink to="/settings" title={collapsed ? "Settings" : undefined} className={sideLink(collapsed)}>
            {({ isActive }) => (
              <>
                <Settings size={18} strokeWidth={isActive ? 2.1 : 1.8} />
                {!collapsed && "Settings"}
              </>
            )}
          </NavLink>
          <button
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "w-full flex items-center h-10 rounded-xl text-sm font-medium text-sidebar-ink/60 hover:bg-white/[0.06] hover:text-white transition-colors",
              collapsed ? "justify-center" : "gap-3 px-3"
            )}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={18} /> Collapse</>}
          </button>

          <SidebarUserSection collapsed={collapsed} />
        </div>
      </aside>

      {/* ── Main column ── */}
      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col min-h-dvh transition-[margin] duration-200 ease-out",
          collapsed ? "lg:ml-[68px]" : "lg:ml-60"
        )}
      >
        {/* Top bar — z-50 so the household dropdown sits above the sidebar */}
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-line pt-[env(safe-area-inset-top)]">
          <div className="px-4 sm:px-6 h-14 lg:h-16 flex items-center gap-2 sm:gap-4">
            {/* Mobile mark */}
            <svg className="lg:hidden shrink-0" width="26" height="26" viewBox="0 0 40 40" fill="none" aria-label="HomeSync">
              <path d="M20 4L4 18H9V34H17V24H23V34H31V18H36L20 4Z" fill="#0f5238" />
              <rect x="26" y="8" width="4" height="8" rx="1" fill="#0a3d29" />
              <rect x="17" y="17" width="6" height="5" rx="1" fill="#edf7f0" />
            </svg>

            <div className="flex-1 flex items-center min-w-0">
              <HouseholdSelector />
            </div>

            <UserMenu />
          </div>
        </header>

        <main
          key={pathname}
          className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-12 animate-fade-in"
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        aria-label="Main"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/92 backdrop-blur-md border-t border-line safe-area-pb"
      >
        <div className="grid grid-cols-5 px-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors active:bg-cream-dark/60",
                  isActive ? "text-primary" : "text-charcoal-muted"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-primary" aria-hidden="true" />}
                  <Icon size={21} strokeWidth={isActive ? 2.2 : 1.7} />
                  <span className={cn("text-[11px] leading-none truncate", isActive ? "font-semibold" : "font-medium")}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
