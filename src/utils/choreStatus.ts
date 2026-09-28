import { getFrequencyDays } from "../services/chore.service";
import type { Chore, ChoreCompletionLog, ChoreFrequency, ChoreStatus } from "../types/chore.types";

/**
 * Status for Fixed / Personal chores: based on whether THIS user completed it
 * within the frequency window.
 */
export function computeStatus(
  choreId: string,
  targetUserId: string,
  frequency: ChoreFrequency,
  completions: ChoreCompletionLog[],
  deadline?: string | null
): ChoreStatus {
  const today = new Date().toISOString().slice(0, 10);

  if (deadline) {
    const completedAfterDeadline = completions.some(
      (c) => c.choreId === choreId && c.completedBy === targetUserId && c.completedAt.slice(0, 10) >= deadline
    );
    if (completedAfterDeadline) return "Completed";
    return today > deadline ? "Overdue" : "Pending";
  }

  const logs = completions
    .filter((c) => c.choreId === choreId && c.completedBy === targetUserId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  if (logs.length === 0) return "Pending";
  const daysSince =
    (Date.now() - new Date(logs[0].completedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= getFrequencyDays(frequency) ? "Completed" : "Overdue";
}

/**
 * Status for Rotating chores. Key rule: the current assignee is "Completed"
 * only when their most recent completion is newer than every other participant's
 * most recent completion (i.e. they completed it *this* cycle). Otherwise the
 * clock is measured from the last completion by anyone.
 *
 * This fixes the cycle-wrap bug where old completion logs from a previous
 * rotation cycle would falsely show "Completed" for the returning assignee.
 */
export function computeRotatingStatus(
  chore: Chore,
  completions: ChoreCompletionLog[]
): ChoreStatus {
  const assigneeId = chore.currentAssigneeId;
  if (!assigneeId) return "Pending";

  const today = new Date().toISOString().slice(0, 10);

  // Deadline overrides normal frequency logic
  if (chore.deadline) {
    const completedAfterDeadline = completions.some(
      (c) => c.choreId === chore.id && c.completedBy === assigneeId && c.completedAt.slice(0, 10) >= chore.deadline!
    );
    if (completedAfterDeadline) return "Completed";
    return today > chore.deadline ? "Overdue" : "Pending";
  }

  // All completion logs for this chore, newest first
  const allLogs = completions
    .filter((c) => c.choreId === chore.id)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (allLogs.length === 0) return "Pending";

  const mostRecent = allLogs[0];

  // If the very latest completion is by the current assignee, they've done their turn.
  if (mostRecent.completedBy === assigneeId) return "Completed";

  // Current assignee hasn't completed it yet — check if they're overdue.
  // "Overdue" = more than one frequency period has elapsed since the last completion.
  const daysSinceLast =
    (Date.now() - new Date(mostRecent.completedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLast > getFrequencyDays(chore.frequency) ? "Overdue" : "Pending";
}

export function getDisplayStatus(
  chore: Chore,
  viewingUserId: string,
  completions: ChoreCompletionLog[]
): ChoreStatus {
  if (chore.assignmentType === "Rotating") {
    return computeRotatingStatus(chore, completions);
  }
  const targetUserId =
    chore.assignmentType === "Fixed" ? viewingUserId : chore.createdBy;
  return computeStatus(chore.id, targetUserId, chore.frequency, completions, chore.deadline);
}

export function isChoreEnded(chore: Chore): boolean {
  if (!chore.endDate) return false;
  return new Date().toISOString().slice(0, 10) > chore.endDate;
}

export function getUserStatus(
  chore: Chore,
  userId: string,
  completions: ChoreCompletionLog[]
): ChoreStatus | null {
  if (chore.assignmentType === "Rotating") {
    if (chore.currentAssigneeId !== userId) return null;
    return computeRotatingStatus(chore, completions);
  }
  if (chore.assignmentType === "Personal" && chore.createdBy !== userId) return null;
  if (
    chore.assignmentType === "Fixed" &&
    chore.participants.length > 0 &&
    !chore.participants.includes(userId)
  )
    return null;
  return computeStatus(chore.id, userId, chore.frequency, completions, chore.deadline);
}
