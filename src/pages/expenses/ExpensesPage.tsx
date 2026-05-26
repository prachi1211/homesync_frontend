import { useState, useMemo } from "react";
import {
  Plus, Trash2, Pencil, ChevronDown, ChevronUp,
  ShoppingCart, Zap, Home, UtensilsCrossed, Car, Tv, Heart, Wrench, Tag,
  ArrowRight, Loader2, Receipt, TrendingDown, TrendingUp, X, Banknote,
  DollarSign, Handshake,
} from "lucide-react";
import { useExpense } from "../../hooks/useExpense";
import { useHousehold } from "../../hooks/useHousehold";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { computeNetBalances, simplifyDebts } from "../../services/expense.service";
import { EXPENSE_CATEGORIES } from "../../types/expense.types";
import type {
  AddExpensePayload, AddSettlementPayload, BalancePair,
  Expense, ExpenseCategory, Settlement, SplitType,
} from "../../types/expense.types";
import type { HouseholdMember } from "../../types/household.types";
import { cn } from "../../utils/cn";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ConfirmModal } from "../../components/ui/Modal";

// ── Category meta ─────────────────────────────────────────────────────────────

const CATEGORY_META: Record<ExpenseCategory, { icon: React.ElementType; color: string; bg: string }> = {
  Groceries:     { icon: ShoppingCart,    color: "text-green-700",      bg: "bg-green-50" },
  Utilities:     { icon: Zap,             color: "text-amber-700",      bg: "bg-amber-50" },
  Rent:          { icon: Home,            color: "text-blue-700",       bg: "bg-blue-50" },
  Dining:        { icon: UtensilsCrossed, color: "text-orange-700",     bg: "bg-orange-50" },
  Transport:     { icon: Car,             color: "text-sky-700",        bg: "bg-sky-50" },
  Entertainment: { icon: Tv,              color: "text-purple-700",     bg: "bg-purple-50" },
  Healthcare:    { icon: Heart,           color: "text-rose-700",       bg: "bg-rose-50" },
  Household:     { icon: Wrench,          color: "text-stone-600",      bg: "bg-stone-100" },
  Other:         { icon: Tag,             color: "text-charcoal-muted", bg: "bg-cream-dark" },
};

function CategoryIcon({ category }: { category: ExpenseCategory }) {
  const { icon: Icon, color, bg } = CATEGORY_META[category];
  return (
    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
      <Icon size={16} className={color} />
    </div>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function getMemberName(userId: string, members: HouseholdMember[]): string {
  return members.find((m) => m.userId === userId)?.userName ?? "Unknown";
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today)     return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Balance Card ──────────────────────────────────────────────────────────────

function BalanceCard({
  pair, members, userId, onSettle,
}: {
  pair: BalancePair;
  members: HouseholdMember[];
  userId: string;
  onSettle: (pair: BalancePair) => void;
}) {
  const fromName  = getMemberName(pair.fromUserId, members);
  const toName    = getMemberName(pair.toUserId,   members);
  const youOwe    = pair.fromUserId === userId;
  const owedToYou = pair.toUserId   === userId;

  return (
    <div className={cn(
      "flex items-center justify-between bg-white rounded-2xl border p-4 gap-3",
      youOwe ? "border-error/20" : owedToYou ? "border-primary/20" : "border-border",
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          youOwe ? "bg-error-light" : owedToYou ? "bg-primary-light" : "bg-cream-dark",
        )}>
          {youOwe
            ? <TrendingDown size={16} className="text-error" />
            : owedToYou
              ? <TrendingUp   size={16} className="text-primary" />
              : <ArrowRight   size={16} className="text-charcoal-muted" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-charcoal truncate">
            {youOwe ? `You owe ${toName}` : owedToYou ? `${fromName} owes you` : `${fromName} owes ${toName}`}
          </p>
          <p className={cn(
            "text-lg font-bold",
            youOwe ? "text-error" : owedToYou ? "text-primary" : "text-charcoal",
          )}>
            {formatCurrency(pair.amount)}
          </p>
        </div>
      </div>
      {(youOwe || owedToYou) && (
        <button
          onClick={() => onSettle(pair)}
          className="shrink-0 text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 bg-primary-light rounded-lg px-3 py-1.5"
        >
          Settle <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

// ── Expense Row ───────────────────────────────────────────────────────────────

const SPLIT_LABEL: Record<SplitType, string> = {
  Equal: "Equal", Percentage: "By %", Exact: "Exact",
};

function ExpenseRow({
  expense, members, userId, onEdit, onDelete,
}: {
  expense: Expense;
  members: HouseholdMember[];
  userId: string;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const paidByName = getMemberName(expense.paidBy, members);
  const paidByYou  = expense.paidBy === userId;
  const yourSplit  = expense.splits.find((s) => s.userId === userId);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left flex items-center gap-3 p-4 hover:bg-cream/50 transition-colors"
      >
        <CategoryIcon category={expense.category} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold text-charcoal text-sm truncate">{expense.description}</span>
            <span className="font-bold text-charcoal shrink-0">{formatCurrency(expense.amount)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              paidByYou
                ? "bg-primary-light text-primary"
                : "bg-cream-dark text-charcoal-muted",
            )}>
              {paidByYou ? "You paid" : `${paidByName} paid`}
            </span>
            {expense.splits.length > 1 && (
              <span className="text-xs text-charcoal-muted">
                {SPLIT_LABEL[expense.splitType]} · {expense.splits.length} people
              </span>
            )}
            {yourSplit && !paidByYou && (
              <span className="text-xs text-charcoal-muted">
                Your share: {formatCurrency(yourSplit.amount)}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-charcoal-muted ml-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 bg-cream/40 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider mb-2">Splits</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {expense.splits.map((split) => {
                const name = getMemberName(split.userId, members);
                return (
                  <div key={split.userId} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {getInitials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-charcoal truncate">{name}</p>
                      <p className="text-xs text-charcoal-muted">{formatCurrency(split.amount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {expense.notes && (
            <p className="text-xs text-charcoal-muted italic border-t border-border pt-2">
              {expense.notes}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
            <button
              onClick={() => onEdit(expense)}
              className="flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-light"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => onDelete(expense)}
              className="flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-error transition-colors px-3 py-1.5 rounded-lg hover:bg-error-light"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settlement Row (in timeline) ──────────────────────────────────────────────

function SettlementRow({
  settlement, members, userId,
}: {
  settlement: Settlement;
  members: HouseholdMember[];
  userId: string;
}) {
  const fromName   = getMemberName(settlement.fromUserId, members);
  const toName     = getMemberName(settlement.toUserId,   members);
  const fromIsYou  = settlement.fromUserId === userId;
  const toIsYou    = settlement.toUserId   === userId;

  return (
    <div className="bg-primary-light/40 rounded-2xl border border-primary/10 flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
        <Handshake size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-charcoal">
          {fromIsYou ? "You" : fromName} paid {toIsYou ? "you" : toName}
        </p>
        {settlement.note && (
          <p className="text-xs text-charcoal-muted truncate">{settlement.note}</p>
        )}
      </div>
      <span className="font-bold text-primary shrink-0">{formatCurrency(settlement.amount)}</span>
    </div>
  );
}

// ── Expense form ──────────────────────────────────────────────────────────────

interface SplitRowState {
  userId: string;
  selected: boolean;
  amount: string;
  percentage: string;
}

function initSplitRows(members: HouseholdMember[], expense?: Expense): SplitRowState[] {
  if (!expense) {
    return members.map((m) => ({ userId: m.userId, selected: true, amount: "", percentage: "" }));
  }
  const splitMap = new Map(expense.splits.map((s) => [s.userId, s]));
  return members.map((m) => {
    const s = splitMap.get(m.userId);
    return {
      userId:     m.userId,
      selected:   !!s,
      amount:     s ? String(s.amount)     : "",
      percentage: s ? String(s.percentage) : "",
    };
  });
}

function ExpenseModal({
  open, onClose, expense, members, userId, isSinglePerson, onSave,
}: {
  open: boolean;
  onClose: () => void;
  expense?: Expense;
  members: HouseholdMember[];
  userId: string;
  isSinglePerson: boolean;
  onSave: (payload: AddExpensePayload, id?: string) => Promise<void>;
}) {
  const isEdit = !!expense;

  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount,      setAmount]      = useState(expense ? String(expense.amount) : "");
  const [category,    setCategory]    = useState<ExpenseCategory>(expense?.category ?? "Other");
  const [date,        setDate]        = useState(expense?.date ?? new Date().toISOString().slice(0, 10));
  const [paidBy,      setPaidBy]      = useState(expense?.paidBy ?? userId);
  const [splitType,   setSplitType]   = useState<SplitType>(expense?.splitType ?? "Equal");
  const [notes,       setNotes]       = useState(expense?.notes ?? "");
  const [splitRows,   setSplitRows]   = useState<SplitRowState[]>(() => initSplitRows(members, expense));
  const [formError,   setFormError]   = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);

  const totalAmount  = parseFloat(amount) || 0;
  const selectedRows = splitRows.filter((r) => r.selected);
  const pctSum       = selectedRows.reduce((s, r) => s + (parseFloat(r.percentage) || 0), 0);
  const exactSum     = selectedRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const equalShare   = selectedRows.length > 0 && totalAmount > 0
    ? round2(totalAmount / selectedRows.length) : 0;
  const pctOk   = Math.abs(pctSum - 100) < 0.01;
  const exactOk = totalAmount > 0 && Math.abs(exactSum - totalAmount) < 0.01;

  async function handleSubmit() {
    setFormError(null);
    if (!description.trim()) { setFormError("Description is required"); return; }
    if (totalAmount <= 0)    { setFormError("Amount must be greater than 0"); return; }
    if (!isSinglePerson && selectedRows.length === 0) {
      setFormError("Select at least one participant"); return;
    }
    if (!isSinglePerson && splitType === "Percentage" && !pctOk) {
      setFormError(`Percentages sum to ${pctSum.toFixed(1)}% — must equal 100%`); return;
    }
    if (!isSinglePerson && splitType === "Exact" && !exactOk) {
      setFormError(`Amounts sum to ${formatCurrency(exactSum)} — must equal ${formatCurrency(totalAmount)}`); return;
    }

    const splits = isSinglePerson
      ? [{ userId, amount: 0, percentage: 100 }]
      : selectedRows.map((r) => ({
          userId: r.userId,
          amount:     splitType === "Exact"      ? (parseFloat(r.amount)     || 0) : 0,
          percentage: splitType === "Percentage" ? (parseFloat(r.percentage) || 0) : 0,
        }));

    const payload: AddExpensePayload = {
      description: description.trim(),
      amount: totalAmount,
      category,
      date,
      paidBy: isSinglePerson ? userId : paidBy,
      splitType: isSinglePerson ? "Equal" : splitType,
      splits,
      notes: notes.trim(),
    };

    setSaving(true);
    try {
      await onSave(payload, isEdit ? expense!.id : undefined);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:rounded-2xl sm:max-w-xl shadow-2xl animate-slide-up max-h-[92dvh] overflow-y-auto rounded-t-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-border rounded-t-2xl">
          <h2 className="font-bold text-lg text-charcoal">{isEdit ? "Edit Expense" : "Add Expense"}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-cream-dark transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Weekly groceries"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              icon={<DollarSign size={16} />}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-charcoal">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
              >
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra details…"
            />
          </div>

          {/* Multi-person split section */}
          {!isSinglePerson && (
            <>
              {/* Paid By */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal">Paid by</label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button
                      key={m.userId}
                      type="button"
                      onClick={() => setPaidBy(m.userId)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                        paidBy === m.userId
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-charcoal border-border hover:border-primary/40",
                      )}
                    >
                      {m.userId === userId ? "You" : m.userName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Type tabs */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-charcoal">Split type</label>
                <div className="flex rounded-xl border border-border p-1 gap-1 bg-cream">
                  {(["Equal", "Percentage", "Exact"] as SplitType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSplitType(t)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        splitType === t
                          ? "bg-white text-primary shadow-sm"
                          : "text-charcoal-muted hover:text-charcoal",
                      )}
                    >
                      {t === "Percentage" ? "By %" : t}
                    </button>
                  ))}
                </div>

                {/* Participant rows */}
                <div className="space-y-2">
                  {members.map((m, i) => {
                    const row = splitRows[i];
                    if (!row) return null;
                    const displayName = m.userId === userId ? "You" : m.userName;
                    return (
                      <div
                        key={m.userId}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors",
                          row.selected
                            ? "border-primary/20 bg-primary-light/50"
                            : "border-border bg-white opacity-60",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSplitRows((prev) =>
                              prev.map((r, j) => j === i ? { ...r, selected: !r.selected } : r)
                            )
                          }
                          className={cn(
                            "w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                            row.selected
                              ? "bg-primary border-primary"
                              : "border-charcoal-muted/40 bg-white",
                          )}
                        >
                          {row.selected && (
                            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>

                        <span className="text-sm font-medium text-charcoal flex-1 truncate">
                          {displayName}
                        </span>

                        {row.selected && splitType === "Equal" && equalShare > 0 && (
                          <span className="text-xs text-charcoal-muted shrink-0">
                            {formatCurrency(equalShare)}
                          </span>
                        )}

                        {row.selected && splitType === "Percentage" && (
                          <>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={row.percentage}
                              onChange={(e) =>
                                setSplitRows((prev) =>
                                  prev.map((r, j) => j === i ? { ...r, percentage: e.target.value } : r)
                                )
                              }
                              placeholder="0"
                              className="w-20 rounded-lg border border-border px-3 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                            />
                            <span className="text-xs text-charcoal-muted w-3 shrink-0">%</span>
                          </>
                        )}

                        {row.selected && splitType === "Exact" && (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.amount}
                            onChange={(e) =>
                              setSplitRows((prev) =>
                                prev.map((r, j) => j === i ? { ...r, amount: e.target.value } : r)
                              )
                            }
                            placeholder="0.00"
                            className="w-24 rounded-lg border border-border px-3 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Running total feedback */}
                {splitType === "Percentage" && selectedRows.length > 0 && (
                  <div className={cn(
                    "flex items-center justify-between text-xs font-medium px-3 py-1.5 rounded-lg",
                    pctOk ? "bg-primary-light text-primary" : "bg-error-light text-error",
                  )}>
                    <span>Total assigned</span>
                    <span>{pctSum.toFixed(1)}% / 100%</span>
                  </div>
                )}
                {splitType === "Exact" && selectedRows.length > 0 && totalAmount > 0 && (
                  <div className={cn(
                    "flex items-center justify-between text-xs font-medium px-3 py-1.5 rounded-lg",
                    exactOk ? "bg-primary-light text-primary" : "bg-error-light text-error",
                  )}>
                    <span>Assigned / Total</span>
                    <span>{formatCurrency(exactSum)} / {formatCurrency(totalAmount)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {formError && (
            <p className="text-sm text-error bg-error-light rounded-xl px-4 py-3">{formError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            {isEdit ? "Save Changes" : "Add Expense"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Settle Up Modal ───────────────────────────────────────────────────────────

function SettleUpModal({
  open, onClose, pair, members, userId, onSave,
}: {
  open: boolean;
  onClose: () => void;
  pair: BalancePair | null;
  members: HouseholdMember[];
  userId: string;
  onSave: (payload: AddSettlementPayload) => Promise<void>;
}) {
  const [amount, setAmount] = useState(pair ? String(pair.amount) : "");
  const [note,   setNote]   = useState("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  if (!open || !pair) return null;

  const fromName = pair.fromUserId === userId ? "You"  : getMemberName(pair.fromUserId, members);
  const toName   = pair.toUserId   === userId ? "you"  : getMemberName(pair.toUserId,   members);

  async function handleSave() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({ fromUserId: pair!.fromUserId, toUserId: pair!.toUserId, amount: amt, note: note.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-lg text-charcoal">Settle Up</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-cream-dark transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-charcoal-muted">
            Recording a payment from{" "}
            <strong className="text-charcoal">{fromName}</strong>
            {" "}to{" "}
            <strong className="text-charcoal">{toName}</strong>.
          </p>
          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            icon={<DollarSign size={16} />}
          />
          <Input
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Venmo transfer"
          />
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={saving}>Record Payment</Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function ExpensesPage() {
  const {
    expenses, settlements, isLoading,
    addExpense, updateExpense, deleteExpense, recordSettlement,
  } = useExpense();
  const { activeHousehold, members, isSinglePersonMode } = useHousehold();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense,  setEditExpense]  = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [settleTarget, setSettleTarget] = useState<BalancePair | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const balancePairs = useMemo(() => {
    if (isSinglePersonMode || !user) return [];
    return simplifyDebts(computeNetBalances(expenses, settlements));
  }, [expenses, settlements, isSinglePersonMode, user]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0),
    [expenses, currentMonth],
  );
  const monthlyCount = expenses.filter((e) => e.date.startsWith(currentMonth)).length;
  const allTimeTotal = expenses.reduce((s, e) => s + e.amount, 0);

  type TimelineItem = { kind: "expense"; data: Expense } | { kind: "settlement"; data: Settlement };

  const groupedTimeline = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();

    for (const exp of expenses) {
      const items = map.get(exp.date) ?? [];
      items.push({ kind: "expense", data: exp });
      map.set(exp.date, items);
    }

    for (const s of settlements) {
      const date = s.createdAt.slice(0, 10);
      const items = map.get(date) ?? [];
      items.push({ kind: "settlement", data: s });
      map.set(date, items);
    }

    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => [date, items] as [string, TimelineItem[]]);
  }, [expenses, settlements]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleSaveExpense(payload: AddExpensePayload, id?: string) {
    if (id) {
      await updateExpense(id, payload);
      addToast("success", "Expense updated");
    } else {
      await addExpense(payload);
      addToast("success", "Expense added");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteTarget.id);
      addToast("success", "Expense deleted");
      setDeleteTarget(null);
    } catch {
      addToast("error", "Failed to delete expense");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSettle(payload: AddSettlementPayload) {
    await recordSettlement(payload);
    addToast("success", "Payment recorded");
    setSettleTarget(null);
  }

  // ── Empty: no household ────────────────────────────────────────────────────

  if (!activeHousehold) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-cream-dark flex items-center justify-center">
          <Receipt size={28} className="text-charcoal-muted" />
        </div>
        <h2 className="font-bold text-charcoal text-lg">No household selected</h2>
        <p className="text-sm text-charcoal-muted max-w-xs">
          Join or create a household to start tracking shared expenses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-charcoal tracking-tight">Expenses</h1>
          <p className="text-charcoal-muted mt-1 text-sm">
            {isSinglePersonMode
              ? "Track your personal spending."
              : "Track, split, and settle household costs."}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => { setEditExpense(null); setShowAddModal(true); }}
          className="shrink-0"
        >
          <Plus size={16} className="mr-1 -ml-0.5" />
          Add
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Balance cards */}
          {!isSinglePersonMode && balancePairs.length > 0 && (
            <section>
              <h2 className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider mb-3">
                Balances
              </h2>
              <div className="space-y-2">
                {balancePairs.map((pair, i) => (
                  <BalanceCard
                    key={i}
                    pair={pair}
                    members={members}
                    userId={user!.id}
                    onSettle={setSettleTarget}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All-settled banner */}
          {!isSinglePersonMode && balancePairs.length === 0 && expenses.length > 0 && (
            <div className="flex items-center gap-3 bg-primary-light border border-primary/10 rounded-2xl px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                <Banknote size={16} />
              </div>
              <div>
                <p className="font-semibold text-primary text-sm">All settled up!</p>
                <p className="text-xs text-primary/60">No outstanding balances in your household.</p>
              </div>
            </div>
          )}

          {/* Summary cards */}
          {expenses.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-border p-4">
                <p className="text-xs text-charcoal-muted font-medium mb-1">This month</p>
                <p className="text-2xl font-bold text-charcoal">{formatCurrency(monthlyTotal)}</p>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  {monthlyCount} {monthlyCount === 1 ? "expense" : "expenses"}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4">
                <p className="text-xs text-charcoal-muted font-medium mb-1">All time</p>
                <p className="text-2xl font-bold text-charcoal">{formatCurrency(allTimeTotal)}</p>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
                </p>
              </div>
            </div>
          )}

          {/* Expense log */}
          {groupedTimeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cream-dark flex items-center justify-center">
                <Receipt size={24} className="text-charcoal-muted" />
              </div>
              <h3 className="font-semibold text-charcoal">No expenses yet</h3>
              <p className="text-sm text-charcoal-muted max-w-xs">
                Add your first expense to start tracking{" "}
                {isSinglePersonMode ? "your" : "shared"} costs.
              </p>
              <Button size="sm" onClick={() => setShowAddModal(true)}>
                <Plus size={14} className="mr-1" /> Add Expense
              </Button>
            </div>
          ) : (
            <section className="space-y-6">
              {groupedTimeline.map(([date, items]) => (
                <div key={date}>
                  <h2 className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider mb-3">
                    {formatDate(date)}
                  </h2>
                  <div className="space-y-2">
                    {items.map((item) =>
                      item.kind === "expense" ? (
                        <ExpenseRow
                          key={item.data.id}
                          expense={item.data}
                          members={members}
                          userId={user!.id}
                          onEdit={(e) => { setEditExpense(e); setShowAddModal(true); }}
                          onDelete={setDeleteTarget}
                        />
                      ) : (
                        <SettlementRow
                          key={item.data.id}
                          settlement={item.data}
                          members={members}
                          userId={user!.id}
                        />
                      )
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      <ExpenseModal
        key={editExpense?.id ?? "new"}
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditExpense(null); }}
        expense={editExpense ?? undefined}
        members={members}
        userId={user?.id ?? ""}
        isSinglePerson={isSinglePersonMode}
        onSave={handleSaveExpense}
      />

      {/* Settle Up Modal */}
      <SettleUpModal
        key={settleTarget ? `${settleTarget.fromUserId}-${settleTarget.toUserId}` : "settle"}
        open={!!settleTarget}
        onClose={() => setSettleTarget(null)}
        pair={settleTarget}
        members={members}
        userId={user?.id ?? ""}
        onSave={handleSettle}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description={`Delete "${deleteTarget?.description}"? This can't be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
