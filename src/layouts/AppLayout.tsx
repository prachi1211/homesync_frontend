import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, CheckSquare, CreditCard, BarChart2,
  Settings, LogOut, ChevronDown, ChevronLeft, ChevronRight, Home,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { Logo } from "../components/ui/Logo";
import { HouseholdSelector } from "../components/household/HouseholdSelector";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard",  Icon: LayoutDashboard },
  { to: "/groceries", label: "Groceries",  Icon: ShoppingBag },
  { to: "/chores",    label: "Chores",     Icon: CheckSquare },
  { to: "/expenses",  label: "Expenses",   Icon: CreditCard },
  { to: "/analytics", label: "Analytics",  Icon: BarChart2 },
];

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ── User menu (top bar) ───────────────────────────────────────────────────────

function UserMenu() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
    addToast("info", "Signed out", "You've been logged out.");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-cream-dark transition-colors"
        aria-label="User menu"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs">
          {getInitials(user?.name)}
        </div>
        <span className="hidden sm:block text-sm font-medium text-charcoal max-w-[120px] truncate">
          {user?.name ?? "Account"}
        </span>
        <ChevronDown size={14} className="text-charcoal-muted hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E8E6E1] py-1 z-10 animate-slide-up">
          <div className="px-4 py-2.5 border-b border-[#E8E6E1]">
            <p className="text-sm font-semibold text-charcoal truncate">{user?.name}</p>
            <p className="text-xs text-charcoal-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); navigate("/settings"); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-light hover:bg-cream hover:text-charcoal transition-colors"
          >
            <Settings size={15} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error-light transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sidebar user section ──────────────────────────────────────────────────────

function SidebarUserSection({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
    addToast("info", "Signed out", "You've been logged out.");
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[#a8e7c5] font-bold text-xs">
          {getInitials(user?.name)}
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="text-[#6b7280] hover:text-white transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[#a8e7c5] font-bold text-xs shrink-0">
        {getInitials(user?.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{user?.name ?? "Account"}</p>
        <p className="text-xs text-[#6b7280] truncate">{user?.email}</p>
      </div>
      <button
        onClick={handleLogout}
        className="shrink-0 text-[#6b7280] hover:text-white transition-colors"
        aria-label="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

// ── App layout ────────────────────────────────────────────────────────────────

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar_collapsed") === "true"
  );

  function toggleSidebar() {
    setCollapsed((v) => {
      localStorage.setItem("sidebar_collapsed", String(!v));
      return !v;
    });
  }

  return (
    <div className="min-h-screen bg-cream flex">

      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 flex-col z-40 bg-[#141414] transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo / icon */}
        <div className={`py-5 border-b border-white/[0.06] flex items-center ${collapsed ? "justify-center px-0" : "px-5"}`}>
          {collapsed ? (
            <Home size={22} className="text-[#a8e7c5]" />
          ) : (
            <Logo size="sm" light />
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                } ${
                  isActive
                    ? "bg-primary/20 text-[#a8e7c5]"
                    : "text-[#9ca3af] hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                  {!collapsed && label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: collapse toggle + settings + user */}
        <div className={`pb-4 border-t border-white/[0.06] pt-3 space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-full flex items-center py-2.5 rounded-xl text-[#6b7280] hover:bg-white/[0.06] hover:text-white transition-all ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
          >
            {collapsed ? <ChevronRight size={17} /> : (
              <>
                <ChevronLeft size={17} />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>

          {/* Settings */}
          <NavLink
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              `flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-primary/20 text-[#a8e7c5]"
                  : "text-[#9ca3af] hover:bg-white/[0.06] hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                {!collapsed && "Settings"}
              </>
            )}
          </NavLink>

          <SidebarUserSection collapsed={collapsed} />
        </div>
      </aside>

      {/* ── Main column ── */}
      {/* z-50 on header so dropdowns inside it appear above the sidebar */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? "lg:ml-16" : "lg:ml-60"}`}>

        {/* Top bar — z-50 so HouseholdSelector dropdown sits above the sidebar */}
        <header className="sticky top-0 z-50 bg-white border-b border-[#E8E6E1]">
          <div className="px-4 sm:px-6 h-14 flex items-center gap-4">
            {/* Mobile logo */}
            <div className="lg:hidden shrink-0">
              <Logo size="sm" />
            </div>

            {/* Household selector */}
            <div className="flex-1 flex items-center min-w-0">
              <HouseholdSelector />
            </div>

            {/* User menu */}
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-8 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E8E6E1] z-40 safe-area-pb">
        <div className="flex items-center justify-around px-1 pt-1 pb-2">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-0 transition-colors ${
                  isActive ? "text-primary" : "text-charcoal-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={21} strokeWidth={isActive ? 2.2 : 1.7} />
                  <span className="text-[10px] font-semibold leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
