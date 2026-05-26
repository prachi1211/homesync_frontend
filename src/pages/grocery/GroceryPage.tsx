import { useState, type FormEvent } from "react";
import { useGrocery } from "../../hooks/useGrocery";
import { useToast } from "../../context/ToastContext";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal, ConfirmModal } from "../../components/ui/Modal";
import type {
  AddGroceryPayload,
  GroceryItem,
  Priority,
  PriorityFilter,
  StatusFilter,
  UpdateGroceryPayload,
} from "../../types/grocery.types";

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Bakery",
  "Meat & Fish",
  "Pantry",
  "Beverages",
  "Frozen",
  "Household",
  "Other",
];

const FREQUENT_ITEMS: Array<{ name: string; category: string; priority: Priority }> = [
  { name: "Eggs", category: "Produce", priority: "Medium" },
  { name: "Milk", category: "Dairy", priority: "Medium" },
  { name: "Coffee", category: "Beverages", priority: "Low" },
  { name: "Bread", category: "Bakery", priority: "Low" },
];

const DEFAULT_FORM: AddGroceryPayload = {
  name: "",
  qty: 1,
  category: "Produce",
  priority: null,
  notes: "",
};

const HISTORY_LIMIT = 8;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getPriorityDot(priority: Priority) {
  switch (priority) {
    case "High":   return "bg-error";
    case "Medium": return "bg-warning";
    case "Low":    return "bg-info";
  }
}

function getPriorityText(priority: Priority) {
  switch (priority) {
    case "High":   return "text-error";
    case "Medium": return "text-warning";
    case "Low":    return "text-info";
  }
}

// ── PriorityBadge ──────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority | null }) {
  if (!priority) return null;
  return (
    <span className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(priority)}`} />
      <span className={`text-[10px] font-bold uppercase ${getPriorityText(priority)}`}>
        {priority}
      </span>
    </span>
  );
}

// ── StarButton ─────────────────────────────────────────────────────────────────

function StarButton({
  starred,
  onClick,
}: {
  starred: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={starred ? "Unstar item" : "Star item"}
      className={`p-1.5 rounded-md transition-all ${
        starred
          ? "text-warning hover:text-warning/70"
          : "text-charcoal-muted/25 hover:text-warning/60"
      }`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={starred ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}

// ── FilterDropdown ─────────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="appearance-none pl-3 pr-7 py-2 rounded-md border border-charcoal-muted/20 bg-white text-charcoal text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:border-charcoal-muted/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-muted">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

// ── SelectField (reusable form control) ───────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-md border border-charcoal-muted/25 hover:border-charcoal-muted/40 bg-white text-charcoal text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const PRIORITY_OPTIONS = [
  { value: "", label: "No Priority" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

// ── EditItemModal ──────────────────────────────────────────────────────────────

function EditItemModal({
  item,
  onClose,
  onSave,
}: {
  item: GroceryItem;
  onClose: () => void;
  onSave: (payload: UpdateGroceryPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<UpdateGroceryPayload>({
    name: item.name,
    qty: item.qty,
    category: item.category,
    priority: item.priority,
    notes: item.notes,
  });
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError("Item name is required");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Item"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-charcoal-muted hover:text-charcoal transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-item-form"
            disabled={saving}
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin-slow h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </>
      }
    >
      <form id="edit-item-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider ml-0.5">
            Item Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              if (nameError) setNameError(null);
            }}
            className={`w-full px-3.5 py-2.5 rounded-md border bg-white text-charcoal text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              nameError
                ? "border-error ring-1 ring-error/20"
                : "border-charcoal-muted/25 hover:border-charcoal-muted/40"
            }`}
          />
          {nameError && (
            <p className="text-xs text-error ml-0.5 animate-fade-in">{nameError}</p>
          )}
        </div>

        {/* Qty */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider ml-0.5">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            value={form.qty}
            onChange={(e) =>
              setForm((p) => ({ ...p, qty: Math.max(1, Number(e.target.value)) }))
            }
            className="w-full px-3.5 py-2.5 rounded-md border border-charcoal-muted/25 hover:border-charcoal-muted/40 bg-white text-charcoal font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Category"
            value={form.category}
            onChange={(v) => setForm((p) => ({ ...p, category: v }))}
            options={CATEGORY_OPTIONS}
          />
          <SelectField
            label="Priority"
            value={form.priority ?? ""}
            onChange={(v) => setForm((p) => ({ ...p, priority: (v as Priority) || null }))}
            options={PRIORITY_OPTIONS}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider ml-0.5">
            Notes <span className="normal-case font-medium">(optional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Add any details, brand preferences, etc."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-md border border-charcoal-muted/25 hover:border-charcoal-muted/40 bg-white text-charcoal text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-charcoal-muted/40"
          />
        </div>
      </form>
    </Modal>
  );
}

// ── ItemRow ────────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onToggle,
  onStar,
  onEdit,
  onDelete,
}: {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onStar: (id: string) => void;
  onEdit: (item: GroceryItem) => void;
  onDelete: (item: GroceryItem) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 hover:bg-cream transition-colors group ${
        item.isBought ? "opacity-45" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Checkbox */}
        <div className="relative flex items-center shrink-0">
          <input
            type="checkbox"
            checked={item.isBought}
            onChange={() => onToggle(item.id)}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-charcoal-muted/30 bg-white transition-all checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity">
            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          </span>
        </div>

        {/* Name, meta, notes */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={`font-semibold text-sm transition-all ${
              item.isBought ? "line-through text-charcoal-muted" : "text-charcoal"
            }`}
          >
            {item.name}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-1.5 py-0.5 bg-cream-dark rounded text-[10px] font-bold text-charcoal-muted uppercase tracking-tight">
              ×{item.qty}
            </span>
            <PriorityBadge priority={item.priority} />
          </div>
          {item.notes && (
            <p className="text-xs text-charcoal-muted/70 italic mt-0.5 truncate max-w-xs">
              {item.notes}
            </p>
          )}
        </div>
      </div>

      {/* Right side: star (always visible) + edit/delete (hover) */}
      <div className="flex items-center gap-0.5 shrink-0 ml-2">
        <StarButton starred={item.starred} onClick={() => onStar(item.id)} />

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
          {/* Edit */}
          <button
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
            className="p-2 text-charcoal-muted/50 hover:text-primary hover:bg-primary-light rounded-lg transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(item)}
            aria-label={`Remove ${item.name}`}
            className="p-2 text-charcoal-muted/50 hover:text-error hover:bg-error-light rounded-lg transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RecentlyBought ─────────────────────────────────────────────────────────────

function RecentlyBought({
  items,
  onRestore,
}: {
  items: GroceryItem[];
  onRestore: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const recent = [...items]
    .filter((i) => i.isBought)
    .sort((a, b) => {
      if (!a.boughtAt && !b.boughtAt) return 0;
      if (!a.boughtAt) return 1;
      if (!b.boughtAt) return -1;
      return new Date(b.boughtAt).getTime() - new Date(a.boughtAt).getTime();
    })
    .slice(0, HISTORY_LIMIT);

  if (recent.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-charcoal-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-charcoal">Recently Bought</span>
          <span className="text-xs font-bold text-charcoal-muted bg-cream-dark px-2 py-0.5 rounded-full">
            {recent.length}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`text-charcoal-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-charcoal-muted/5 divide-y divide-charcoal-muted/5">
          {recent.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-cream transition-colors"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-charcoal-muted line-through">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-charcoal-muted/50 uppercase">
                    {item.category}
                  </span>
                  <span className="text-charcoal-muted/30">·</span>
                  <span className="px-1.5 py-0.5 bg-cream-dark rounded text-[10px] font-bold text-charcoal-muted/60 uppercase">
                    ×{item.qty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRestore(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary-light hover:bg-primary hover:text-white rounded-md transition-all shrink-0 ml-3"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Restore
              </button>
            </div>
          ))}
          {items.filter((i) => i.isBought).length > HISTORY_LIMIT && (
            <p className="px-5 py-3 text-xs text-charcoal-muted/60 text-center">
              Showing {HISTORY_LIMIT} most recent
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function GroceryPage() {
  const { items, isLoading, addItem, updateItem, toggleBought, toggleStarred, deleteItem, clearBought } =
    useGrocery();
  const { addToast } = useToast();

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");
  const [starredOnly, setStarredOnly] = useState(false);

  // Add form
  const [form, setForm] = useState<AddGroceryPayload>(DEFAULT_FORM);
  const [nameError, setNameError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Modals
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GroceryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Duplicate detection (same name + same priority = same item) ──────────

  const duplicateItem = form.name.trim()
    ? items.find(
        (i) =>
          i.name.toLowerCase() === form.name.trim().toLowerCase() &&
          i.priority === form.priority &&
          !i.isBought
      )
    : null;

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredItems = items.filter((item) => {
    if (statusFilter === "Unbought" && item.isBought) return false;
    if (statusFilter === "Bought" && !item.isBought) return false;
    if (priorityFilter !== "All" && item.priority !== priorityFilter) return false;
    if (starredOnly && !item.starred) return false;
    return true;
  });

  // Sort: starred first within each category
  const sortedFiltered = [...filteredItems].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return 0;
  });

  const orderedCats = CATEGORIES.filter((cat) =>
    sortedFiltered.some((i) => i.category === cat)
  );
  const customCats = [
    ...new Set(sortedFiltered.map((i) => i.category).filter((c) => !CATEGORIES.includes(c))),
  ];
  const visibleCategories = [...orderedCats, ...customCats];

  const boughtCount = items.filter((i) => i.isBought).length;
  const unboughtCount = items.filter((i) => !i.isBought).length;
  const activeFilterCount = [
    statusFilter !== "All",
    priorityFilter !== "All",
    starredOnly,
  ].filter(Boolean).length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError("Item name is required");
      return;
    }
    // If name+priority match an existing item, increment its qty instead
    if (duplicateItem) {
      await handleIncrementQty(duplicateItem, form.qty);
      return;
    }
    setAdding(true);
    try {
      await addItem(form);
      setForm((prev) => ({ ...prev, name: "", qty: 1, notes: "" }));
      addToast("success", `${form.name.trim()} added to list`);
    } catch (err) {
      addToast("error", "Failed to add item", (err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function handleIncrementQty(existing: GroceryItem, by: number) {
    setAdding(true);
    try {
      await updateItem(existing.id, {
        name: existing.name,
        qty: existing.qty + by,
        category: existing.category,
        priority: existing.priority,
        notes: existing.notes,
      });
      addToast("success", `${existing.name} qty updated to ×${existing.qty + by}`);
      setForm((prev) => ({ ...prev, name: "", qty: 1, notes: "" }));
    } catch (err) {
      addToast("error", "Failed to update quantity", (err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function handleQuickAdd(frequent: (typeof FREQUENT_ITEMS)[number]) {
    const existing = items.find(
      (i) =>
        i.name.toLowerCase() === frequent.name.toLowerCase() &&
        i.priority === frequent.priority &&
        !i.isBought
    );
    if (existing) {
      try {
        await updateItem(existing.id, {
          name: existing.name,
          qty: existing.qty + 1,
          category: existing.category,
          priority: existing.priority,
          notes: existing.notes,
        });
        addToast("success", `${frequent.name} qty increased to ×${existing.qty + 1}`);
      } catch {
        addToast("error", "Failed to update quantity");
      }
      return;
    }
    try {
      await addItem({ name: frequent.name, qty: 1, category: frequent.category, priority: frequent.priority, notes: "" });
      addToast("success", `${frequent.name} added`);
    } catch (err) {
      addToast("error", "Failed to add item", (err as Error).message);
    }
  }

  async function handleToggle(id: string) {
    try {
      await toggleBought(id);
    } catch {
      addToast("error", "Failed to update item");
    }
  }

  async function handleStar(id: string) {
    try {
      await toggleStarred(id);
    } catch {
      addToast("error", "Failed to star item");
    }
  }

  async function handleSaveEdit(payload: UpdateGroceryPayload) {
    if (!editingItem) return;
    try {
      await updateItem(editingItem.id, payload);
      addToast("success", "Item updated");
    } catch (err) {
      addToast("error", "Failed to update item", (err as Error).message);
      throw err;
    }
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await deleteItem(deletingItem.id);
      addToast("success", `${deletingItem.name} removed`);
      setDeletingItem(null);
    } catch {
      addToast("error", "Failed to remove item");
    } finally {
      setDeleting(false);
    }
  }

  async function handleClearBought() {
    setClearing(true);
    try {
      await clearBought();
      addToast("success", "Bought items cleared");
    } catch {
      addToast("error", "Failed to clear items");
    } finally {
      setClearing(false);
    }
  }

  function resetFilters() {
    setStatusFilter("All");
    setPriorityFilter("All");
    setStarredOnly(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-charcoal tracking-tight">
            Groceries
          </h1>
          <p className="text-charcoal-muted mt-1">
            {unboughtCount > 0
              ? `${unboughtCount} item${unboughtCount === 1 ? "" : "s"} left to buy`
              : items.length > 0
              ? "All done — nothing left to buy!"
              : "Your shopping list is empty"}
          </p>
        </div>

        {boughtCount > 0 && (
          <button
            onClick={handleClearBought}
            disabled={clearing}
            className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-error transition-colors disabled:opacity-50 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Clear bought ({boughtCount})
          </button>
        )}
      </header>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown<StatusFilter>
          label="Status filter"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "All", label: "All Items" },
            { value: "Unbought", label: "Unbought" },
            { value: "Bought", label: "Bought" },
          ]}
        />

        <FilterDropdown<PriorityFilter>
          label="Priority filter"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { value: "All", label: "All Priorities" },
            { value: "High", label: "High Priority" },
            { value: "Medium", label: "Medium Priority" },
            { value: "Low", label: "Low Priority" },
          ]}
        />

        {/* Starred toggle */}
        <button
          onClick={() => setStarredOnly((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm font-semibold transition-all ${
            starredOnly
              ? "bg-warning/10 border-warning/30 text-warning"
              : "bg-white border-charcoal-muted/20 text-charcoal-muted hover:border-charcoal-muted/40 hover:text-charcoal"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={starredOnly ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Starred
        </button>

        {/* Reset */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-sm text-charcoal-muted hover:text-charcoal transition-colors ml-1"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Clear filters
            <span className="ml-0.5 text-xs bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>

      {/* Add item form */}
      <section className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm p-5 space-y-3">
        <h3 className="text-xs font-bold text-charcoal-muted uppercase tracking-widest">
          Add Item
        </h3>

        <form onSubmit={handleAdd} className="space-y-3">
          {/* Row 1: main fields */}
          <div className="flex flex-wrap gap-3 items-end">
            {/* Name */}
            <div className="flex-1 min-w-[180px] space-y-1">
              <label className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider ml-0.5">
                Item Name
              </label>
              <input
                type="text"
                placeholder="e.g. Almond Milk"
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }));
                  if (nameError) setNameError(null);
                }}
                className={`w-full px-3.5 py-2.5 rounded-md border bg-white text-charcoal text-sm placeholder:text-charcoal-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  nameError
                    ? "border-error ring-1 ring-error/20"
                    : duplicateItem
                    ? "border-warning ring-1 ring-warning/20"
                    : "border-charcoal-muted/25 hover:border-charcoal-muted/40"
                }`}
              />
              {nameError && (
                <p className="text-xs text-error ml-0.5 animate-fade-in">{nameError}</p>
              )}
              {duplicateItem && !nameError && (
                <p className="text-xs text-primary ml-0.5 animate-fade-in flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Already in list (×{duplicateItem.qty}) — clicking Add will increase the quantity
                </p>
              )}
            </div>

            {/* Qty */}
            <div className="w-20 space-y-1">
              <label className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider ml-0.5">
                Qty
              </label>
              <input
                type="number"
                min={1}
                value={form.qty}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))
                }
                className="w-full px-3.5 py-2.5 rounded-md border border-charcoal-muted/25 hover:border-charcoal-muted/40 bg-white text-charcoal font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Category */}
            <div className="flex-1 min-w-[140px]">
              <SelectField
                label="Category"
                value={form.category}
                onChange={(v) => setForm((prev) => ({ ...prev, category: v }))}
                options={CATEGORY_OPTIONS}
              />
            </div>

            {/* Priority (optional) */}
            <div className="w-36">
              <SelectField
                label="Priority (optional)"
                value={form.priority ?? ""}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, priority: (v as Priority) || null }))
                }
                options={PRIORITY_OPTIONS}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2.5 bg-primary text-white rounded-md font-semibold text-sm hover:bg-primary-hover transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {adding ? (
                <>
                  <svg className="animate-spin-slow h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {duplicateItem ? "Updating…" : "Adding…"}
                </>
              ) : duplicateItem ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  +{form.qty} Qty
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>

          {/* Row 2: notes */}
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Add a note (optional) — brand, size, store preference…"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="flex-1 px-3.5 py-2 rounded-md border border-charcoal-muted/20 bg-cream text-charcoal text-sm placeholder:text-charcoal-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </form>
      </section>

      {/* Quick-add bar */}
      <div className="bg-primary-light rounded-lg border border-primary/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-primary bg-white p-1.5 rounded-md shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <p className="text-sm text-primary font-medium">
            Frequent:{" "}
            <span className="font-bold">
              {FREQUENT_ITEMS.map((i) => i.name).join(", ")}
            </span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FREQUENT_ITEMS.slice(0, 3).map((item) => (
            <button
              key={item.name}
              onClick={() => handleQuickAdd(item)}
              className="px-3 py-1.5 bg-white rounded-full text-xs font-bold border border-primary/15 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              {item.name} +
            </button>
          ))}
        </div>
      </div>

      {/* Item list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin-slow h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="cart"
          title="Your list is empty"
          description="Add your first item above or use the quick-add buttons."
        />
      ) : sortedFiltered.length === 0 ? (
        <div className="text-center py-14">
          <EmptyState
            icon="search"
            title="No items match your filters"
            description="Try adjusting the status, priority, or starred filter."
          />
          <button
            onClick={resetFilters}
            className="mt-2 text-sm text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleCategories.map((cat) => {
            const catItems = sortedFiltered.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-extrabold text-charcoal-muted uppercase tracking-widest">
                    {cat}
                  </h3>
                  <span className="text-[10px] font-bold text-charcoal-muted/50 uppercase">
                    {catItems.length} {catItems.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm overflow-hidden divide-y divide-charcoal-muted/5">
                  {catItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      onStar={handleStar}
                      onEdit={setEditingItem}
                      onDelete={setDeletingItem}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recently Bought */}
      {!isLoading && items.length > 0 && (
        <RecentlyBought items={items} onRestore={handleToggle} />
      )}

      {/* Edit modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title="Remove item?"
        description={`Are you sure you want to remove "${deletingItem?.name}" from your list? This cannot be undone.`}
        confirmLabel="Remove"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
