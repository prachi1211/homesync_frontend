import { Link } from "react-router-dom";
import { useState, type ReactNode } from "react";
import {
  ShoppingBag, CheckSquare, CreditCard, Scale, ArrowRight, CheckCircle2, Handshake,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useHousehold } from "../hooks/useHousehold";
import { useGrocery } from "../hooks/useGrocery";
import { useChore } from "../hooks/useChore";
import { useExpense } from "../hooks/useExpense";
import { computeNetBalances } from "../services/expense.service";
import { getUserStatus, isChoreEnded } from "../utils/choreStatus";
import { SinglePersonBanner } from "../components/household/SinglePersonBanner";
import { cn } from "../utils/cn";
import type { ChoreStatus } from "../types/chore.types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const moneyRound = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function joinPhrases(parts: string[]) {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// ── Pieces ────────────────────────────────────────────────────────────────────

function StatTile({
  icon, label, value, sub, tone = "default", to,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "default" | "alert" | "good";
  to?: string;
}) {
  const body = (
    <div className="h-full min-w-0 bg-white rounded-2xl border border-line p-4 sm:p-5 shadow-card transition-[border-color,box-shadow] duration-150 group-hover:border-charcoal-muted/25 group-hover:shadow-md">
      <div className="flex items-center gap-2 text-charcoal-muted">
        <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        <span className="text-xs sm:text-[13px] font-medium truncate">{label}</span>
      </div>
      <p className="mt-3 text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-charcoal tabular leading-none truncate">
        {value}
      </p>
      <p
        className={cn(
          "mt-2 text-xs truncate",
          tone === "alert" ? "text-error font-medium" : tone === "good" ? "text-sage-dark" : "text-charcoal-muted"
        )}
      >
        {sub}
      </p>
    </div>
  );
  return to ? (
    <Link to={to} className="group block min-w-0 rounded-2xl active:scale-[0.985] transition-transform duration-150">
      {body}
    </Link>
  ) : (
    <div className="min-w-0">{body}</div>
  );
}

function Panel({ title, to, linkLabel, children }: { title: string; to: string; linkLabel: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-line shadow-card overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <h2 className="text-[15px] font-semibold text-charcoal">{title}</h2>
        <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover rounded-lg">
          {linkLabel} <ArrowRight size={14} />
        </Link>
      </header>
      {children}
    </section>
  );
}

const statusPill: Record<ChoreStatus, string> = {
  Overdue: "bg-error-light text-error",
  Pending: "bg-warning-light text-warning",
  Completed: "bg-sage-light text-sage-dark",
};
const statusText: Record<ChoreStatus, string> = { Overdue: "Overdue", Pending: "Due", Completed: "Done" };
const statusOrder: Record<ChoreStatus, number> = { Overdue: 0, Pending: 1, Completed: 2 };

// ── Page ──────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth();
  const { activeHousehold, members, isSinglePersonMode } = useHousehold();
  const { items: groceryItems } = useGrocery();
  const { chores, completions } = useChore();
  const { expenses, settlements } = useExpense();

  const [mountedAt] = useState(() => Date.now());
  const userId = user?.id ?? "";
  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Groceries
  const toBuy = groceryItems.filter((i) => !i.isBought);
  const urgentBuys = toBuy.filter((i) => i.priority === "High");

  // Chores — same status rules as the Chores page
  const myChores = chores
    .filter((c) => !isChoreEnded(c))
    .map((c) => ({ chore: c, status: getUserStatus(c, userId, completions) }))
    .filter((x): x is { chore: typeof x.chore; status: ChoreStatus } => x.status !== null)
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  const myOverdue = myChores.filter((x) => x.status === "Overdue").length;
  const myDue = myChores.filter((x) => x.status === "Pending").length;
  const weekAgo = mountedAt - 7 * 86400000;
  const doneThisWeek = completions.filter(
    (c) => c.completedBy === userId && new Date(c.completedAt).getTime() >= weekAgo
  ).length;

  // Money
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const monthlySpending = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const myNet = isSinglePersonMode ? 0 : computeNetBalances(expenses, settlements)[userId] ?? 0;
  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  // One plain sentence about what needs attention today
  const attention = [
    myOverdue > 0 && `${plural(myOverdue, "chore")} overdue`,
    urgentBuys.length > 0 && `${plural(urgentBuys.length, "urgent grocery", "urgent groceries")}`,
    myNet < -0.01 && `${moneyRound.format(-myNet)} to settle up`,
  ].filter(Boolean) as string[];
  const summary = attention.length > 0
    ? `You have ${joinPhrases(attention)}.`
    : myDue > 0
      ? `${plural(myDue, "chore")} due for you — nothing overdue.`
      : "Everything is taken care of. Enjoy the quiet.";

  const memberName = (id: string) =>
    id === userId ? "You" : members.find((m) => m.userId === id)?.userName.split(" ")[0] ?? "Someone";

  return (
    <div className="space-y-8">

      {/* ── Greeting ── */}
      <header className="animate-slide-up">
        <h1 className="font-display text-[2.125rem] sm:text-[2.75rem] leading-[1.05] text-charcoal">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-2.5 text-[15px] sm:text-base text-charcoal-light max-w-xl">{summary}</p>
        {activeHousehold && (
          <p className="mt-1 text-sm text-charcoal-muted">
            {activeHousehold.name} · {plural(members.length || 1, "member")}
          </p>
        )}
      </header>

      <SinglePersonBanner />

      {/* ── At a glance ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile
          icon={<ShoppingBag />}
          label="To buy"
          value={String(toBuy.length)}
          sub={urgentBuys.length > 0 ? `${urgentBuys.length} high priority` : toBuy.length === 0 ? "List is clear" : "Nothing urgent"}
          tone={urgentBuys.length > 0 ? "alert" : toBuy.length === 0 ? "good" : "default"}
          to="/groceries"
        />
        <StatTile
          icon={<CheckSquare />}
          label="Chores"
          value={String(myOverdue + myDue)}
          sub={myOverdue > 0 ? `${myOverdue} overdue` : myDue > 0 ? "On schedule" : "All done"}
          tone={myOverdue > 0 ? "alert" : myDue === 0 ? "good" : "default"}
          to="/chores"
        />
        <StatTile
          icon={<CreditCard />}
          label="This month"
          value={moneyRound.format(monthlySpending)}
          sub={monthExpenses.length > 0 ? plural(monthExpenses.length, "expense") : "No expenses yet"}
          to="/expenses"
        />
        {isSinglePersonMode ? (
          <StatTile
            icon={<CheckCircle2 />}
            label="This week"
            value={String(doneThisWeek)}
            sub={doneThisWeek > 0 ? "Chores completed" : "Nothing logged yet"}
            to="/chores"
          />
        ) : (
          <StatTile
            icon={<Scale />}
            label="Balance"
            value={Math.abs(myNet) < 0.01 ? "Settled" : moneyRound.format(Math.abs(myNet))}
            sub={myNet > 0.01 ? "Owed to you" : myNet < -0.01 ? "You owe" : "All square"}
            tone={myNet < -0.01 ? "alert" : myNet > 0.01 ? "good" : "default"}
            to="/expenses"
          />
        )}
      </div>

      {/* ── Today ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Your chores" to="/chores" linkLabel="All chores">
          {myChores.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-charcoal-muted">
              No chores assigned to you. <Link to="/chores" className="text-primary font-medium hover:underline">Add one</Link> to share the load.
            </p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {myChores.slice(0, 5).map(({ chore, status }) => (
                <li key={chore.id}>
                  <Link to="/chores" className="flex items-center gap-3 px-5 py-3 hover:bg-cream/70 transition-colors">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        status === "Overdue" ? "bg-error" : status === "Pending" ? "bg-warning" : "bg-sage"
                      )}
                      aria-hidden="true"
                    />
                    <span className={cn("flex-1 min-w-0 truncate text-sm", status === "Completed" ? "text-charcoal-muted" : "text-charcoal font-medium")}>
                      {chore.name}
                    </span>
                    <span className={cn("shrink-0 text-xs font-medium px-2 py-0.5 rounded-full", statusPill[status])}>
                      {statusText[status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent spending" to="/expenses" linkLabel="All expenses">
          {recentExpenses.length === 0 && settlements.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-charcoal-muted">
              Nothing logged yet. <Link to="/expenses" className="text-primary font-medium hover:underline">Add an expense</Link> when someone pays for the house.
            </p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {recentExpenses.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{e.description}</p>
                    <p className="text-xs text-charcoal-muted truncate">
                      {shortDate.format(new Date(`${e.date}T12:00:00`))} · {e.category}
                      {!isSinglePersonMode && ` · ${memberName(e.paidBy)} paid`}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-charcoal tabular">{money.format(e.amount)}</span>
                </li>
              ))}
              {!isSinglePersonMode && myNet < -0.01 && (
                <li>
                  <Link to="/expenses" className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-primary hover:bg-primary-light/60 transition-colors">
                    <Handshake size={16} /> Settle up {moneyRound.format(-myNet)}
                  </Link>
                </li>
              )}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
