import { Link } from "react-router-dom";
import {
  ShoppingBag, CheckSquare, Users, CreditCard,
  ArrowRight, AlertCircle, TrendingUp, Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useHousehold } from "../hooks/useHousehold";
import { useGrocery } from "../hooks/useGrocery";
import { useChore } from "../hooks/useChore";
import { useExpense } from "../hooks/useExpense";
import { computeNetBalances, simplifyDebts } from "../services/expense.service";
import { SinglePersonBanner } from "../components/household/SinglePersonBanner";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "primary" | "sage" | "amber" | "error" | "muted";
  href?: string;
}

function StatCard({ icon, label, value, sub, accent = "primary", href }: StatCardProps) {
  const accentMap = {
    primary: "bg-primary-light text-primary",
    sage: "bg-sage-light text-sage",
    amber: "bg-warning-light text-warning",
    error: "bg-error-light text-error",
    muted: "bg-cream-dark text-charcoal-muted",
  };

  const inner = (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] transition-shadow group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-charcoal tracking-tight leading-none">{value}</p>
        <p className="text-sm font-semibold text-charcoal mt-0.5">{label}</p>
        {sub && <p className="text-xs text-charcoal-muted mt-0.5">{sub}</p>}
      </div>
      {href && (
        <div className="mt-auto pt-1">
          <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
            View <ArrowRight size={11} />
          </span>
        </div>
      )}
    </div>
  );

  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { activeHousehold, members, isSinglePersonMode } = useHousehold();
  const { items: groceryItems } = useGrocery();
  const { chores, completions } = useChore();
  const { expenses, settlements } = useExpense();

  const currentMonth    = new Date().toISOString().slice(0, 7);
  const monthlySpending = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((s, e) => s + e.amount, 0);
  const monthlyCount    = expenses.filter((e) => e.date.startsWith(currentMonth)).length;

  const balancePairs    = !isSinglePersonMode && user
    ? simplifyDebts(computeNetBalances(expenses, settlements))
    : [];
  const youOweCount     = balancePairs.filter((p) => p.fromUserId === user?.id).length;
  const owedToYouCount  = balancePairs.filter((p) => p.toUserId   === user?.id).length;

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const unboughtCount = groceryItems.filter((i) => !i.isBought).length;
  const highPriority = groceryItems.filter((i) => !i.isBought && i.priority === "High");

  const totalChores = chores.filter((c) => c.assignmentType !== "Personal");
  const overdueChores = totalChores.filter((c) => {
    const log = [...completions]
      .filter((l) => l.choreId === c.id)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
    if (!log) return true;
    const freq: Record<string, number> = {
      Daily: 1, Every2Days: 2, Every3Days: 3, Weekly: 7, Biweekly: 14, Monthly: 30,
    };
    const days = freq[c.frequency] ?? 7;
    return (Date.now() - new Date(log.completedAt).getTime()) / 86400000 > days;
  });

  const needsAttention = highPriority.length > 0 || overdueChores.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Greeting ── */}
      <div>
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
          {getGreeting()}
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-charcoal tracking-tight">
          {firstName}!
        </h1>
        {activeHousehold && (
          <p className="text-charcoal-muted mt-1 text-sm">
            {activeHousehold.name}
            {members.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Users size={12} className="inline" />
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            )}
          </p>
        )}
      </div>

      {/* ── Solo banner ── */}
      <SinglePersonBanner />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="To Buy"
          value={unboughtCount}
          sub={groceryItems.length === 0 ? "Empty list" : `${groceryItems.length} total items`}
          accent={unboughtCount > 0 ? "primary" : "sage"}
          href="/groceries"
        />
        <StatCard
          icon={<CheckSquare size={18} />}
          label="Chores Active"
          value={totalChores.length}
          sub={overdueChores.length > 0 ? `${overdueChores.length} overdue` : "All on track"}
          accent={overdueChores.length > 0 ? "error" : "sage"}
          href="/chores"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Members"
          value={members.length || 1}
          sub="in this household"
          accent="muted"
        />
        <StatCard
          icon={<CreditCard size={18} />}
          label="Spent This Month"
          value={monthlySpending > 0
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(monthlySpending)
            : "—"}
          sub={monthlyCount > 0
            ? youOweCount > 0
              ? `${youOweCount} balance${youOweCount !== 1 ? "s" : ""} to settle`
              : owedToYouCount > 0
                ? `${owedToYouCount} owed to you`
                : `${monthlyCount} expense${monthlyCount !== 1 ? "s" : ""}`
            : "No expenses yet"}
          accent={youOweCount > 0 ? "error" : "primary"}
          href="/expenses"
        />
      </div>

      {/* ── Needs attention ── */}
      {needsAttention && (
        <section>
          <h2 className="text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertCircle size={13} className="text-warning" />
            Needs Attention
          </h2>
          <div className="space-y-2">
            {highPriority.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to="/groceries"
                className="flex items-center justify-between bg-white rounded-xl border border-[#E8E6E1] px-4 py-3 hover:border-warning/30 hover:bg-warning-light/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-error shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">{item.name}</p>
                    <p className="text-xs text-charcoal-muted">{item.category} · High priority</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-warning bg-warning-light px-2 py-1 rounded-lg shrink-0 ml-3">
                  Buy
                </span>
              </Link>
            ))}
            {overdueChores.slice(0, 3).map((chore) => (
              <Link
                key={chore.id}
                to="/chores"
                className="flex items-center justify-between bg-white rounded-xl border border-[#E8E6E1] px-4 py-3 hover:border-error/30 hover:bg-error-light/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-error shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">{chore.name}</p>
                    <p className="text-xs text-charcoal-muted capitalize">{chore.frequency} · Overdue</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-error bg-error-light px-2 py-1 rounded-lg shrink-0 ml-3">
                  Overdue
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Feature cards ── */}
      <section>
        <h2 className="text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles size={12} />
          Your household
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Groceries */}
          <Link
            to="/groceries"
            className="group bg-white rounded-2xl border border-[#E8E6E1] p-5 flex flex-col gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <ShoppingBag size={22} />
              </div>
              {unboughtCount > 0 ? (
                <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
                  {unboughtCount} to buy
                </span>
              ) : (
                <span className="text-xs font-semibold text-sage bg-sage-light px-2.5 py-1 rounded-full">
                  {groceryItems.length === 0 ? "Empty" : "All done"}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-charcoal">Groceries</h3>
              <p className="text-sm text-charcoal-muted mt-0.5">
                {groceryItems.length === 0
                  ? "Start your shopping list."
                  : `${groceryItems.length} item${groceryItems.length === 1 ? "" : "s"} total · ${unboughtCount} remaining`}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Open list <ArrowRight size={12} />
            </div>
          </Link>

          {/* Chores */}
          <Link
            to="/chores"
            className="group bg-white rounded-2xl border border-[#E8E6E1] p-5 flex flex-col gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <CheckSquare size={22} />
              </div>
              {overdueChores.length > 0 ? (
                <span className="text-xs font-bold text-error bg-error-light px-2.5 py-1 rounded-full">
                  {overdueChores.length} overdue
                </span>
              ) : totalChores.length > 0 ? (
                <span className="text-xs font-bold text-sage bg-sage-light px-2.5 py-1 rounded-full">
                  On track
                </span>
              ) : (
                <span className="text-xs font-semibold text-charcoal-muted bg-cream-dark px-2.5 py-1 rounded-full">
                  Empty
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-charcoal">Chores</h3>
              <p className="text-sm text-charcoal-muted mt-0.5">
                {chores.length === 0
                  ? "Set up household chores."
                  : `${chores.length} chore${chores.length === 1 ? "" : "s"} tracked`}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View chores <ArrowRight size={12} />
            </div>
          </Link>

          {/* Expenses */}
          <Link
            to="/expenses"
            className="group bg-white rounded-2xl border border-[#E8E6E1] p-5 flex flex-col gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <CreditCard size={22} />
              </div>
              {youOweCount > 0 ? (
                <span className="text-xs font-bold text-error bg-error-light px-2.5 py-1 rounded-full">
                  {youOweCount} to settle
                </span>
              ) : owedToYouCount > 0 ? (
                <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
                  {owedToYouCount} owed to you
                </span>
              ) : (
                <span className="text-xs font-semibold text-sage bg-sage-light px-2.5 py-1 rounded-full">
                  {expenses.length === 0 ? "Empty" : "Settled"}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-charcoal">Expenses</h3>
              <p className="text-sm text-charcoal-muted mt-0.5">
                {expenses.length === 0
                  ? "Start tracking shared spending."
                  : `${expenses.length} expense${expenses.length !== 1 ? "s" : ""} · ${monthlyCount} this month`}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View expenses <ArrowRight size={12} />
            </div>
          </Link>

          {/* Analytics */}
          <Link
            to="/analytics"
            className="group bg-white rounded-2xl border border-[#E8E6E1] p-5 flex flex-col gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <TrendingUp size={22} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-charcoal">Analytics</h3>
              <p className="text-sm text-charcoal-muted mt-0.5">Spending trends and household fairness insights.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View analytics <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}
