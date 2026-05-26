export type ChoreFrequency =
  | "Daily"
  | "Every2Days"
  | "Every3Days"
  | "Weekly"
  | "Biweekly"
  | "Monthly";

export type AssignmentType = "Fixed" | "Rotating" | "Personal";
export type ChoreStatus = "Pending" | "Completed" | "Overdue";
export type ChoreTab = "All" | "My" | "Overdue";
export type ViewMode = "grid" | "list";

export interface Chore {
  id: string;
  householdId: string;
  name: string;
  assignmentType: AssignmentType;
  frequency: ChoreFrequency;
  /** Rotating: participant userIds. Fixed: [] (means all). Personal: [creatorId]. */
  participants: string[];
  /** null for Fixed; userId for Rotating / Personal */
  currentAssigneeId: string | null;
  /** Ordered participant list driving rotation */
  rotationQueue: string[];
  createdBy: string;
  createdAt: string;
  /** Optional hard deadline (YYYY-MM-DD): chore is Overdue if today > deadline and not completed since deadline */
  deadline: string | null;
  /** Optional end date for Rotating chores (YYYY-MM-DD): rotation stops and chore shows as ended */
  endDate: string | null;
}

export interface ChoreCompletionLog {
  id: string;
  choreId: string;
  householdId: string;
  completedBy: string;
  completedAt: string;
}

export interface AddChorePayload {
  name: string;
  assignmentType: AssignmentType;
  frequency: ChoreFrequency;
  /** Only used when assignmentType === "Rotating" */
  participants: string[];
  deadline?: string | null;
  endDate?: string | null;
}

export interface UpdateChorePayload {
  name: string;
  frequency: ChoreFrequency;
  participants: string[];
  deadline?: string | null;
  endDate?: string | null;
}

export interface ChoreState {
  chores: Chore[];
  completions: ChoreCompletionLog[];
  isLoading: boolean;
}
