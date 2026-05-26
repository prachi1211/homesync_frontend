import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { useExpense } from "../../hooks/useExpense";
import { useChore } from "../../hooks/useChore";
import { useGrocery } from "../../hooks/useGrocery";
import { useHousehold } from "../../hooks/useHousehold";
import { PieChart as PieIcon, CheckSquare, ShoppingCart, TrendingUp } from "lucide-react";
import { cn } from "../../utils/cn";
import type { ExpenseCategory } from "../../types/expense.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function getLastNMonths(n: number): { key: string; label: string }[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (n - 1 - i));
    return {
      key:   d.toISOString().slice(0, 7),
      label: d.toLocaleDateString("en-US", { month: "short" }),
    };
  });
}

// ── Category colours ──────────────────────────────────────────────────────────

const EXPENSE_COLORS: Record<ExpenseCategory, string> = {
  Groceries:     "#059669",
  Utilities:     "#d97706",
  Rent:          "#2563eb",
  Dining:        "#ea580c",
  Transport:     "#0284c7",
  Entertainment: "#7c3aed",
  Healthcare:    "#e11d48",
  Household:     "#92400e",
  Other:         "#6b7280",
};

const CHART_COLORS = ["#0f5238", "#059669", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];

// ── Custom Tooltips ───────────────────────────────────────────────────────────

function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-charcoal mb-0.5">{label}</p>
      <p className="font-bold text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function CountTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-charcoal mb-0.5">{label}</p>
      <p className="font-bold text-primary">{payload[0].value} {payload[0].value === 1 ? "completion" : "completions"}</p>
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-charcoal mb-0.5">{payload[0].name}</p>
      <p className="font-bold text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

// ── Empty chart placeholder ───────────────────────────────────────────────────

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="h-44 flex items-center justify-center">
      <p className="text-sm text-charcoal-muted text-center">{message}</p>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-charcoal">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { expenses } = useExpense();
  const { chores, completions } = useChore();
  const { items } = useGrocery();
  const { members, isSinglePersonMode } = useHousehold();

  const months = useMemo(() => getLastNMonths(6), []);

  // ── Expense: monthly spending ──────────────────────────────────────────────

  const monthlySpending = useMemo(() =>
    months.map(({ key, label }) => ({
      month: label,
      total: expenses
        .filter((e) => e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0),
    })),
  [expenses, months]);

  const hasSpending = monthlySpending.some((m) => m.total > 0);

  // ── Expense: category breakdown ────────────────────────────────────────────

  const categoryBreakdown = useMemo(() => {
    const map: Partial<Record<ExpenseCategory, number>> = {};
    for (const exp of expenses) {
      map[exp.category] = (map[exp.category] ?? 0) + exp.amount;
    }
    return (Object.entries(map) as [ExpenseCategory, number][])
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // ── Chore: completions per member (last 30 days) ───────────────────────────

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const choreCompletions = useMemo(() => {
    const sharedIds = new Set(
      chores.filter((c) => c.assignmentType !== "Personal").map((c) => c.id)
    );
    return members
      .map((m) => ({
        name: m.userName.split(" ")[0],
        count: completions.filter(
          (c) => c.completedBy === m.userId && c.completedAt >= cutoff && sharedIds.has(c.choreId)
        ).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [members, completions, cutoff, chores]);

  const totalChoreCompletions = choreCompletions.reduce((s, m) => s + m.count, 0);
  const hasChoreData = totalChoreCompletions > 0;

  // ── Grocery: category snapshot ─────────────────────────────────────────────

  const groceryCategories = useMemo(() => {
    const map: Record<string, { total: number; unbought: number }> = {};
    for (const item of items) {
      const cat = item.category || "Other";
      if (!map[cat]) map[cat] = { total: 0, unbought: 0 };
      map[cat].total    += item.qty;
      map[cat].unbought += item.isBought ? 0 : item.qty;
    }
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [items]);

  const totalGroceryItems  = items.reduce((s, i) => s + i.qty, 0);
  const unboughtItems      = items.filter((i) => !i.isBought).reduce((s, i) => s + i.qty, 0);

  // ── Summary stats ──────────────────────────────────────────────────────────

  const currentMonthKey    = new Date().toISOString().slice(0, 7);
  const thisMonthTotal     = expenses
    .filter((e) => e.date.startsWith(currentMonthKey))
    .reduce((s, e) => s + e.amount, 0);
  const topCategory        = categoryBreakdown[0]?.name ?? null;
  const activeChores       = chores.filter((c) => c.assignmentType !== "Personal" || true).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-charcoal tracking-tight">Analytics</h1>
        <p className="text-charcoal-muted mt-1 text-sm">
          Spending trends, chore contributions, and household insights.
        </p>
      </div>

      {/* Summary stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="This month"
          value={formatCurrency(thisMonthTotal)}
          sub={`${expenses.filter((e) => e.date.startsWith(currentMonthKey)).length} expenses`}
          color="text-primary"
        />
        <StatCard
          label="Top category"
          value={topCategory ?? "—"}
          sub={topCategory ? formatCurrency(categoryBreakdown[0]?.value ?? 0) : "No expenses yet"}
          color="text-charcoal"
        />
        <StatCard
          label="Chores done (30d)"
          value={String(totalChoreCompletions)}
          sub={`across ${activeChores} chore${activeChores !== 1 ? "s" : ""}`}
          color="text-sage"
        />
        <StatCard
          label="Grocery items"
          value={String(unboughtItems)}
          sub={`of ${totalGroceryItems} to buy`}
          color="text-charcoal"
        />
      </div>

      {/* Monthly Spending */}
      <Section title="Monthly Spending" icon={<TrendingUp size={14} />}>
        {hasSpending ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlySpending} barSize={28} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f1" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#edf7f0" }} />
              <Bar dataKey="total" fill="#0f5238" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty message="Add expenses to see monthly spending trends." />
        )}
      </Section>

      {/* Category Breakdown + Chore Fairness side by side on desktop */}
      <div className={cn("grid gap-4", isSinglePersonMode ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>

        {/* Category Breakdown */}
        <Section title="Spending by Category" icon={<PieIcon size={14} />}>
          {categoryBreakdown.length > 0 ? (
            <div className="flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={EXPENSE_COLORS[entry.name as ExpenseCategory] ?? "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {categoryBreakdown.slice(0, 5).map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: EXPENSE_COLORS[entry.name as ExpenseCategory] ?? "#6b7280" }}
                      />
                      <span className="text-charcoal-muted">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal font-medium">{formatCurrency(entry.value)}</span>
                      <span className="text-charcoal-muted w-8 text-right">
                        {totalExpenses > 0 ? Math.round((entry.value / totalExpenses) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ChartEmpty message="Add expenses to see category breakdown." />
          )}
        </Section>

        {/* Chore Fairness */}
        <Section
          title={isSinglePersonMode ? "Your Chore Completions" : "Chore Fairness (30 days)"}
          icon={<CheckSquare size={14} />}
        >
          {hasChoreData ? (
            <ResponsiveContainer width="100%" height={180 + Math.max(0, (members.length - 3) * 30)}>
              <BarChart
                data={choreCompletions}
                layout="vertical"
                barSize={20}
                margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f1" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<CountTooltip />} cursor={{ fill: "#edf7f0" }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {choreCompletions.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="Complete some chores to see contributions." />
          )}
        </Section>
      </div>

      {/* Grocery Snapshot */}
      <Section title="Grocery Snapshot" icon={<ShoppingCart size={14} />}>
        {groceryCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {groceryCategories.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3 p-3 rounded-xl bg-cream">
                <div
                  className="w-2 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-charcoal truncate">{cat.name}</p>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    {cat.unbought} to buy · {cat.total} total
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ChartEmpty message="Add grocery items to see category breakdown." />
        )}
      </Section>

    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <p className="text-xs text-charcoal-muted font-medium mb-1">{label}</p>
      <p className={cn("text-xl font-bold truncate", color)}>{value}</p>
      <p className="text-xs text-charcoal-muted mt-0.5 truncate">{sub}</p>
    </div>
  );
}
