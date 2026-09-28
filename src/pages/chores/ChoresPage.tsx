import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { useChore } from "../../hooks/useChore";
import { useAuth } from "../../hooks/useAuth";
import { useHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../context/ToastContext";
import { Modal, ConfirmModal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { cn } from "../../utils/cn";
import { getDisplayStatus, getUserStatus, isChoreEnded } from "../../utils/choreStatus";
import type {
  AddChorePayload,
  AssignmentType,
  Chore,
  ChoreCompletionLog,
  ChoreFrequency,
  ChoreStatus,
  ChoreTab,
  UpdateChorePayload,
  ViewMode,
} from "../../types/chore.types";
import type { HouseholdMember } from "../../types/household.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMemberName(userId: string, members: HouseholdMember[]): string {
  return members.find((m) => m.userId === userId)?.userName ?? "Unknown";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getLastCompletedLabel(
  chore: Chore,
  viewingUserId: string,
  completions: ChoreCompletionLog[],
  members: HouseholdMember[]
): string {
  // Rotating: show the most recent completion by anyone + who did it
  if (chore.assignmentType === "Rotating") {
    const log = completions
      .filter((c) => c.choreId === chore.id)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
    if (!log) return "Never";
    const who = log.completedBy === viewingUserId
      ? "You"
      : getMemberName(log.completedBy, members);
    const dateStr = new Date(log.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${who} · ${dateStr}`;
  }

  const targetUserId =
    chore.assignmentType === "Fixed" ? viewingUserId : chore.createdBy;
  const logs = completions
    .filter((c) => c.choreId === chore.id && c.completedBy === targetUserId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  if (logs.length === 0) return "Never";
  return new Date(logs[0].completedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNextInRotation(chore: Chore, members: HouseholdMember[]): string | null {
  if (
    chore.assignmentType !== "Rotating" ||
    chore.rotationQueue.length < 2 ||
    !chore.currentAssigneeId
  )
    return null;
  const currentIdx = chore.rotationQueue.indexOf(chore.currentAssigneeId);
  const nextId = chore.rotationQueue[(currentIdx + 1) % chore.rotationQueue.length];
  return getMemberName(nextId, members);
}

/** Fix #1: Fixed chores respect participants; empty participants = all members (backward compat) */
function canMarkComplete(chore: Chore, userId: string): boolean {
  if (chore.assignmentType === "Fixed") {
    if (chore.participants.length === 0) return true;
    return chore.participants.includes(userId);
  }
  if (chore.assignmentType === "Rotating") return chore.currentAssigneeId === userId;
  return chore.createdBy === userId;
}

function canManage(chore: Chore, userId: string, members: HouseholdMember[]): boolean {
  const member = members.find((m) => m.userId === userId);
  if (member?.role === "owner") return true;
  return chore.createdBy === userId;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FREQUENCIES: { value: ChoreFrequency; label: string }[] = [
  { value: "Daily", label: "Daily" },
  { value: "Every2Days", label: "Every 2 Days" },
  { value: "Every3Days", label: "Every 3 Days" },
  { value: "Weekly", label: "Weekly" },
  { value: "Biweekly", label: "Biweekly" },
  { value: "Monthly", label: "Monthly" },
];

const ASSIGNMENT_TYPES: { value: AssignmentType; label: string }[] = [
  { value: "Fixed", label: "Fixed" },
  { value: "Rotating", label: "Rotating" },
  { value: "Personal", label: "Personal" },
];

const TYPE_COLORS: Record<AssignmentType, string> = {
  Fixed: "bg-info-light text-info",
  Rotating: "bg-primary-light text-primary",
  Personal: "bg-cream-dark text-charcoal-light",
};

const STATUS_COLORS: Record<ChoreStatus, string> = {
  Completed: "bg-sage-light text-sage",
  Pending: "bg-warning-light text-warning",
  Overdue: "bg-error-light text-error",
};

const STATUS_BORDER: Record<ChoreStatus, string> = {
  Completed: "bg-sage",
  Pending: "bg-warning",
  Overdue: "bg-error",
};

const AVATAR_COLORS = [
  "bg-primary-light text-primary",
  "bg-sage-light text-sage",
  "bg-warning-light text-warning",
  "bg-error-light text-error",
];

// ── Shared UI pieces ──────────────────────────────────────────────────────────

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const colorClass = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0",
        size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs",
        colorClass
      )}
    >
      {getInitials(name)}
    </div>
  );
}

/** Fix #3: custom dropdown arrow wrapper */
function FrequencySelect({
  value,
  onChange,
}: {
  value: ChoreFrequency;
  onChange: (v: ChoreFrequency) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ChoreFrequency)}
        className="w-full px-4 py-2.5 pr-10 bg-white border border-line rounded-lg text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none"
      >
        {FREQUENCIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-muted">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

/** Fix #2: participant picker for Fixed + Rotating (Select All / Deselect All) */
function ParticipantPicker({
  members,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  members: HouseholdMember[];
  selected: string[];
  onToggle: (userId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  const allSelected = selected.length === members.length && members.length > 0;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-charcoal-muted">
          Members
        </label>
        <button
          type="button"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          <span
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
              allSelected ? "bg-primary border-primary" : "border-charcoal-muted/40 bg-white"
            )}
          >
            {allSelected && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const isSelected = selected.includes(member.userId);
          return (
            <button
              key={member.userId}
              type="button"
              onClick={() => onToggle(member.userId)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition",
                isSelected
                  ? "bg-primary-light border-primary/30 text-primary"
                  : "bg-cream border-line text-charcoal-light hover:border-primary/20 hover:text-charcoal"
              )}
            >
              <Avatar name={member.userName} size="sm" />
              {member.userName}
              {isSelected && (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AssignedLabel({
  chore,
  members,
}: {
  chore: Chore;
  members: HouseholdMember[];
}): ReactNode {
  if (chore.assignmentType === "Fixed") {
    const isAll =
      chore.participants.length === 0 || chore.participants.length === members.length;
    if (isAll) return <span className="text-xs font-semibold text-charcoal">All Members</span>;
    return (
      <div className="flex items-center gap-1">
        {chore.participants.slice(0, 3).map((uid) => (
          <Avatar key={uid} name={getMemberName(uid, members)} size="sm" />
        ))}
        {chore.participants.length > 3 && (
          <span className="text-xs font-semibold text-charcoal-muted">
            +{chore.participants.length - 3}
          </span>
        )}
      </div>
    );
  }
  if (chore.assignmentType === "Rotating") {
    const name = chore.currentAssigneeId
      ? getMemberName(chore.currentAssigneeId, members)
      : "—";
    return (
      <div className="flex items-center gap-1.5">
        <Avatar name={name} />
        <span className="text-xs font-semibold text-charcoal">{name}</span>
      </div>
    );
  }
  return <span className="text-xs font-semibold text-charcoal">Just You</span>;
}

// ── Fix #4: Edit Chore Modal ──────────────────────────────────────────────────

interface EditChoreModalProps {
  chore: Chore;
  members: HouseholdMember[];
  onSave: (payload: UpdateChorePayload) => Promise<void>;
  onClose: () => void;
}

function EditChoreModal({ chore, members, onSave, onClose }: EditChoreModalProps) {
  const [name, setName] = useState(chore.name);
  const [frequency, setFrequency] = useState<ChoreFrequency>(chore.frequency);
  // For Fixed backward compat: if participants empty, default to all
  const [participants, setParticipants] = useState<string[]>(
    chore.participants.length === 0 && chore.assignmentType === "Fixed"
      ? members.map((m) => m.userId)
      : chore.participants
  );
  const [deadline, setDeadline] = useState(chore.deadline ?? "");
  const [endDate,  setEndDate]  = useState(chore.endDate ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleParticipant(userId: string) {
    setParticipants((prev) =>
      prev.includes(userId) ? prev.filter((p) => p !== userId) : [...prev, userId]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Chore name is required");
      return;
    }
    if (chore.assignmentType === "Rotating" && participants.length < 2) {
      setError("Rotating chores require at least 2 participants");
      return;
    }
    if (chore.assignmentType === "Fixed" && participants.length === 0) {
      setError("Select at least 1 member");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name,
        frequency,
        participants,
        deadline: deadline || null,
        endDate: chore.assignmentType === "Rotating" ? (endDate || null) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  const showPicker =
    chore.assignmentType === "Fixed" || chore.assignmentType === "Rotating";

  return (
    <Modal open onClose={onClose} title={`Edit "${chore.name}"`}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-charcoal-muted">
            Chore Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-charcoal-muted">
            Frequency
          </label>
          <FrequencySelect value={frequency} onChange={setFrequency} />
        </div>

        {showPicker && (
          <ParticipantPicker
            members={members}
            selected={participants}
            onToggle={toggleParticipant}
            onSelectAll={() => setParticipants(members.map((m) => m.userId))}
            onDeselectAll={() => setParticipants([])}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-charcoal-muted">
              Deadline (optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          {chore.assignmentType === "Rotating" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-charcoal-muted">
                End Date (optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-error font-medium">{error}</p>}

        <div className="flex justify-end gap-3 pt-1 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-line text-charcoal-light rounded-lg font-semibold text-sm hover:bg-cream transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Chore Card (grid) ────────────────────────────────────────────────────────

interface ChoreCardProps {
  chore: Chore;
  userId: string;
  members: HouseholdMember[];
  completions: ChoreCompletionLog[];
  onMarkComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  completing: boolean;
}

function ChoreCard({
  chore,
  userId,
  members,
  completions,
  onMarkComplete,
  onEdit,
  onDelete,
  completing,
}: ChoreCardProps) {
  const ended   = isChoreEnded(chore);
  const status  = ended ? "Completed" : getDisplayStatus(chore, userId, completions);
  const canComplete = !ended && canMarkComplete(chore, userId);
  const canMng = canManage(chore, userId, members);
  const lastDone = getLastCompletedLabel(chore, userId, completions, members);
  const nextPerson = !ended ? getNextInRotation(chore, members) : null;
  const freqLabel = FREQUENCIES.find((f) => f.value === chore.frequency)?.label ?? chore.frequency;

  return (
    <div className="bg-white rounded-2xl border border-line shadow-card hover:shadow-md hover:border-charcoal-muted/25 transition group relative overflow-hidden flex flex-col">
      <div className={cn("absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full", STATUS_BORDER[status])} />

      <div className="p-5 pl-6 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[15px] text-charcoal leading-snug truncate">
              {chore.name}
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-md text-xs font-medium",
                  TYPE_COLORS[chore.assignmentType]
                )}
              >
                {chore.assignmentType}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-cream-dark text-charcoal-light">
                {freqLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-semibold",
                STATUS_COLORS[status]
              )}
            >
              {status}
            </span>
            {canMng && (
              <>
                <button
                  onClick={onEdit}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-charcoal-muted hover:text-primary hover:bg-primary-light transition"
                  aria-label="Edit chore"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={onDelete}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-charcoal-muted hover:text-error hover:bg-error-light transition"
                  aria-label="Delete chore"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-muted">
              Assigned
            </span>
            <AssignedLabel chore={chore} members={members} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-muted">
              Last Done
            </span>
            <span className="text-xs font-semibold text-charcoal-light">{lastDone}</span>
          </div>
          {nextPerson && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-charcoal-muted">
                Up Next
              </span>
              <span className="text-xs font-semibold text-primary">{nextPerson}</span>
            </div>
          )}
          {chore.deadline && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-charcoal-muted">
                Deadline
              </span>
              <span className={cn(
                "text-xs font-semibold",
                new Date().toISOString().slice(0, 10) > chore.deadline ? "text-error" : "text-charcoal-light"
              )}>
                {new Date(chore.deadline + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          )}
          {ended && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-charcoal-muted">
                Ended
              </span>
              <span className="text-xs font-semibold text-charcoal-muted">
                {new Date(chore.endDate! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="mt-auto pt-1">
          {ended ? (
            <div className="w-full py-2.5 rounded-lg text-sm font-semibold text-center text-charcoal-muted bg-cream border border-line">
              Rotation ended
            </div>
          ) : canComplete ? (
            <button
              onClick={onMarkComplete}
              disabled={completing || status === "Completed"}
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-bold transition border",
                status === "Completed"
                  ? "bg-sage-light text-sage border-sage/20 cursor-default"
                  : "bg-white border-line text-charcoal hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50"
              )}
            >
              {completing ? "Saving…" : status === "Completed" ? "Completed ✓" : "Mark Complete"}
            </button>
          ) : chore.assignmentType === "Rotating" ? (
            <div className="w-full py-2.5 rounded-lg text-sm font-semibold text-center text-charcoal-muted bg-cream border border-line">
              Assigned to{" "}
              {chore.currentAssigneeId ? getMemberName(chore.currentAssigneeId, members) : "—"}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Chore Row (list) ──────────────────────────────────────────────────────────

interface ChoreRowProps extends ChoreCardProps {}

function ChoreRow({
  chore,
  userId,
  members,
  completions,
  onMarkComplete,
  onEdit,
  onDelete,
  completing,
}: ChoreRowProps) {
  const ended      = isChoreEnded(chore);
  const status     = ended ? "Completed" : getDisplayStatus(chore, userId, completions);
  const canComplete = !ended && canMarkComplete(chore, userId);
  const canMng = canManage(chore, userId, members);
  const freqLabel = FREQUENCIES.find((f) => f.value === chore.frequency)?.label ?? chore.frequency;

  return (
    <div className="grid grid-cols-12 px-5 py-4 items-center hover:bg-cream transition-colors group">
      <div className="col-span-4 flex flex-col gap-0.5">
        <span className="font-bold text-charcoal group-hover:text-primary transition-colors text-sm truncate">
          {chore.name}
        </span>
        <span
          className={cn(
            "self-start px-1.5 py-0.5 rounded-md text-[11px] font-medium",
            TYPE_COLORS[chore.assignmentType]
          )}
        >
          {chore.assignmentType}
        </span>
      </div>
      <div className="col-span-3">
        <AssignedLabel chore={chore} members={members} />
      </div>
      <div className="col-span-2 text-xs font-semibold text-charcoal-light">{freqLabel}</div>
      <div className="col-span-2">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[11px] font-semibold",
            STATUS_COLORS[status]
          )}
        >
          {status}
        </span>
      </div>
      <div className="col-span-1 flex items-center justify-end gap-2">
        {canComplete && status !== "Completed" && (
          <button
            onClick={onMarkComplete}
            disabled={completing}
            className="text-xs font-bold text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
          >
            {completing ? "…" : "Done"}
          </button>
        )}
        {canMng && (
          <>
            <button
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 text-charcoal-muted hover:text-primary transition"
              aria-label="Edit"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 text-charcoal-muted hover:text-error transition"
              aria-label="Delete"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const BLANK_FORM = {
  name: "",
  assignmentType: "Rotating" as AssignmentType,
  frequency: "Weekly" as ChoreFrequency,
  participants: [] as string[],
  deadline: "",
  endDate: "",
};

export function ChoresPage() {
  const { user } = useAuth();
  const { members, isSinglePersonMode } = useHousehold();
  const {
    chores,
    completions,
    isLoading,
    addChore,
    updateChore,
    markComplete,
    undoComplete,
    deleteChore,
  } = useChore();
  const { addToast } = useToast();

  const [tab, setTab] = useState<ChoreTab>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [completingId, setCompletingId] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Chore | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Chore | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fix #7: recently completed section
  const [showRecent, setShowRecent] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  function openForm() {
    setForm({
      ...BLANK_FORM,
      // Fix #2: default participants to all members for Fixed and Rotating
      participants: members.map((m) => m.userId),
    });
    setFormError("");
    setShowForm(true);
  }

  // Fix #2: Fixed also gets participant selection
  function handleTypeChange(type: AssignmentType) {
    setForm((prev) => ({
      ...prev,
      assignmentType: type,
      participants: type === "Personal" ? [] : members.map((m) => m.userId),
    }));
  }

  function toggleFormParticipant(userId: string) {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((p) => p !== userId)
        : [...prev.participants, userId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const trimmedName = form.name.trim();

    if (!trimmedName) {
      setFormError("Chore name is required");
      return;
    }

    // Fix #6: duplicate name check
    if (chores.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      setFormError("A chore with this name already exists");
      return;
    }

    // Fix #5: rotating requires ≥2 participants
    if (form.assignmentType === "Rotating" && form.participants.length < 2) {
      setFormError("Rotating chores require at least 2 participants");
      return;
    }

    if (
      (form.assignmentType === "Fixed" || form.assignmentType === "Rotating") &&
      form.participants.length === 0
    ) {
      setFormError("Select at least 1 member");
      return;
    }

    setSubmitting(true);
    try {
      const payload: AddChorePayload = {
        name: trimmedName,
        assignmentType: isSinglePersonMode ? "Personal" : form.assignmentType,
        frequency: form.frequency,
        participants: form.participants,
        deadline: form.deadline || null,
        endDate: form.assignmentType === "Rotating" ? (form.endDate || null) : null,
      };
      await addChore(payload);
      addToast("success", "Chore added", `"${trimmedName}" has been added.`);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add chore");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkComplete(chore: Chore) {
    setCompletingId(chore.id);
    try {
      await markComplete(chore.id);
      addToast("success", "Chore completed", `"${chore.name}" marked as complete.`);
    } catch (err) {
      addToast("error", "Error", err instanceof Error ? err.message : "Failed to mark complete");
    } finally {
      setCompletingId(null);
    }
  }

  async function handleSaveEdit(payload: UpdateChorePayload) {
    if (!editTarget) return;
    await updateChore(editTarget.id, payload);
    addToast("success", "Chore updated", `"${payload.name}" has been updated.`);
    setEditTarget(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteChore(deleteTarget.id);
      addToast("info", "Chore deleted", `"${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
    } catch (err) {
      addToast("error", "Error", err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  // Fix #7: restore (undo) a completion
  async function handleRestore(choreId: string, logId: string, choreName: string) {
    setRestoringId(logId);
    try {
      await undoComplete(choreId, logId);
      addToast("info", "Restored", `"${choreName}" marked as incomplete.`);
    } catch (err) {
      addToast("error", "Error", err instanceof Error ? err.message : "Failed to restore");
    } finally {
      setRestoringId(null);
    }
  }

  const overdueCount = useMemo(() => {
    if (!user) return 0;
    return chores.filter((c) => {
      if (c.assignmentType === "Personal" && c.createdBy !== user.id) return false;
      return getUserStatus(c, user.id, completions) === "Overdue";
    }).length;
  }, [chores, completions, user]);

  // Fix #7: most recent completion per chore by the current user
  const recentCompletions = useMemo(() => {
    if (!user) return [];
    const choreIds = new Set(chores.map((c) => c.id));
    const latestPerChore = new Map<string, ChoreCompletionLog>();
    completions
      .filter((c) => c.completedBy === user.id && choreIds.has(c.choreId))
      .forEach((c) => {
        const existing = latestPerChore.get(c.choreId);
        if (!existing || new Date(c.completedAt) > new Date(existing.completedAt)) {
          latestPerChore.set(c.choreId, c);
        }
      });
    return [...latestPerChore.values()]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 8);
  }, [completions, chores, user]);

  const visibleChores = useMemo(() => {
    if (!user) return [];
    return chores
      .filter((chore) => {
        if (chore.assignmentType === "Personal" && chore.createdBy !== user.id) return false;

        if (tab === "My") {
          if (chore.assignmentType === "Fixed") {
            if (chore.participants.length === 0) return true;
            return chore.participants.includes(user.id);
          }
          if (chore.assignmentType === "Rotating") return chore.participants.includes(user.id);
          return chore.createdBy === user.id;
        }

        if (tab === "Overdue") {
          return getUserStatus(chore, user.id, completions) === "Overdue";
        }

        return true;
      })
      .sort((a, b) => {
        const order: Record<ChoreStatus, number> = { Overdue: 0, Pending: 1, Completed: 2 };
        return (
          order[getDisplayStatus(a, user.id, completions)] -
          order[getDisplayStatus(b, user.id, completions)]
        );
      });
  }, [chores, completions, user, tab]);

  if (!user) return null;

  const showParticipantPicker =
    !isSinglePersonMode &&
    (form.assignmentType === "Fixed" || form.assignmentType === "Rotating");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[2rem] sm:text-4xl leading-[1.1] text-charcoal">
            Chores
          </h1>
          <p className="text-charcoal-muted mt-1 text-sm">
            Keep the household running smoothly.
          </p>
        </div>
        <button
          onClick={() => (showForm ? setShowForm(false) : openForm())}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-hover transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            {showForm ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M12 5v14M5 12h14" />
            )}
          </svg>
          {showForm ? "Cancel" : "Add Chore"}
        </button>
      </div>

      {/* Add Chore Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-line shadow-sm p-6 space-y-5 animate-slide-up"
        >
          <h3 className="text-[13px] font-semibold text-charcoal-muted">
            New Chore
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-medium text-charcoal-muted">
                Chore Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Deep clean kitchen"
                className="w-full px-4 py-2.5 bg-white border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Assignment Type — hidden for solo */}
            {!isSinglePersonMode && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-charcoal-muted">
                  Type
                </label>
                <div className="flex bg-cream p-1 rounded-lg border border-line gap-0.5">
                  {ASSIGNMENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleTypeChange(t.value)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition",
                        form.assignmentType === t.value
                          ? "bg-white shadow-sm text-primary"
                          : "text-charcoal-muted hover:text-charcoal"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fix #3: Frequency with dropdown arrow */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-charcoal-muted">
                Frequency
              </label>
              <FrequencySelect
                value={form.frequency}
                onChange={(v) => setForm((p) => ({ ...p, frequency: v }))}
              />
            </div>
          </div>

          {/* Deadline + End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-charcoal-muted">
                Deadline (optional)
              </label>
              <input
                type="date"
                value={form.deadline}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <p className="text-[10px] text-charcoal-muted">Chore is overdue if not done by this date</p>
            </div>
            {!isSinglePersonMode && form.assignmentType === "Rotating" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-charcoal-muted">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <p className="text-[10px] text-charcoal-muted">Rotation stops after this date</p>
              </div>
            )}
          </div>

          {/* Fix #2: participant picker for Fixed AND Rotating */}
          {showParticipantPicker && (
            <ParticipantPicker
              members={members}
              selected={form.participants}
              onToggle={toggleFormParticipant}
              onSelectAll={() => setForm((p) => ({ ...p, participants: members.map((m) => m.userId) }))}
              onDeselectAll={() => setForm((p) => ({ ...p, participants: [] }))}
            />
          )}

          {formError && <p className="text-sm text-error font-medium">{formError}</p>}

          <div className="flex justify-end gap-3 pt-1 border-t border-line">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-line text-charcoal-light rounded-lg font-semibold text-sm hover:bg-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add Chore"}
            </button>
          </div>
        </form>
      )}

      {/* Tabs + View toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-cream border border-line p-1 rounded-xl gap-0.5">
          {(["All", "My", "Overdue"] as ChoreTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5",
                tab === t
                  ? "bg-white text-charcoal shadow-sm"
                  : "text-charcoal-muted hover:text-charcoal"
              )}
            >
              {t === "All" ? "All Chores" : t === "My" ? "My Chores" : "Overdue"}
              {t === "Overdue" && overdueCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 bg-error text-white rounded-full text-[9px] font-black">
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex bg-cream border border-line p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-lg transition",
              viewMode === "grid"
                ? "bg-white text-primary shadow-sm"
                : "text-charcoal-muted hover:text-charcoal"
            )}
            aria-label="Grid view"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-lg transition",
              viewMode === "list"
                ? "bg-white text-primary shadow-sm"
                : "text-charcoal-muted hover:text-charcoal"
            )}
            aria-label="List view"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chore list */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visibleChores.length === 0 ? (
        <EmptyState
          icon="chore"
          title={
            tab === "Overdue"
              ? "No overdue chores"
              : tab === "My"
                ? "No chores assigned to you"
                : "No chores yet"
          }
          description={
            tab === "All" && chores.length === 0
              ? "Add a chore to get your household organized."
              : "Everything is on track!"
          }
          action={
            tab === "All" && chores.length === 0 ? (
              <button
                onClick={openForm}
                className="px-5 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-hover transition-colors"
              >
                Add First Chore
              </button>
            ) : undefined
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleChores.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              userId={user.id}
              members={members}
              completions={completions}
              onMarkComplete={() => handleMarkComplete(chore)}
              onEdit={() => setEditTarget(chore)}
              onDelete={() => setDeleteTarget(chore)}
              completing={completingId === chore.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-line shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-cream border-b border-line text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">
            <div className="col-span-4">Chore</div>
            <div className="col-span-3">Assigned To</div>
            <div className="col-span-2">Frequency</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-line">
            {visibleChores.map((chore) => (
              <ChoreRow
                key={chore.id}
                chore={chore}
                userId={user.id}
                members={members}
                completions={completions}
                onMarkComplete={() => handleMarkComplete(chore)}
                onEdit={() => setEditTarget(chore)}
                onDelete={() => setDeleteTarget(chore)}
                completing={completingId === chore.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fix #7: Recently Completed section */}
      {recentCompletions.length > 0 && (
        <div className="bg-white rounded-xl border border-line shadow-sm overflow-hidden">
          <button
            onClick={() => setShowRecent((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-cream transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-sage"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm font-bold text-charcoal">Recently Completed</span>
              <span className="text-xs font-semibold text-charcoal-muted bg-cream-dark px-2 py-0.5 rounded-full">
                {recentCompletions.length}
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
              className={cn(
                "text-charcoal-muted transition-transform",
                showRecent ? "rotate-180" : ""
              )}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showRecent && (
            <div className="border-t border-line divide-y divide-line">
              {recentCompletions.map((log) => {
                const chore = chores.find((c) => c.id === log.choreId);
                if (!chore) return null;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-cream transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-charcoal truncate">
                          {chore.name}
                        </p>
                        <p className="text-xs text-charcoal-muted">
                          {new Date(log.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestore(chore.id, log.id, chore.name)}
                      disabled={restoringId === log.id}
                      className="ml-4 shrink-0 text-xs font-bold text-charcoal-muted hover:text-primary border border-line hover:border-primary/30 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      {restoringId === log.id ? "…" : "Restore"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Fix #4: Edit modal */}
      {editTarget && (
        <EditChoreModal
          chore={editTarget}
          members={members}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will remove the chore from all members' lists. Completion history will be preserved for analytics."
        confirmLabel="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
