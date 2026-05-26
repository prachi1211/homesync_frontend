export type SplitType = "Equal" | "Percentage" | "Exact";

export type ExpenseCategory =
  | "Groceries"
  | "Utilities"
  | "Rent"
  | "Dining"
  | "Transport"
  | "Entertainment"
  | "Healthcare"
  | "Household"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Groceries", "Utilities", "Rent", "Dining", "Transport",
  "Entertainment", "Healthcare", "Household", "Other",
];

export interface ExpenseSplit {
  id?: string;
  userId: string;
  amount: number;    // dollar share (always set after creation)
  percentage: number; // percentage share (always set; 0 for equal/exact when not relevant)
}

export interface Expense {
  id: string;
  householdId: string;
  description: string;
  amount: number;        // total in dollars (2 decimal precision)
  category: ExpenseCategory;
  date: string;          // "YYYY-MM-DD"
  paidBy: string;        // userId of payer
  splitType: SplitType;
  splits: ExpenseSplit[]; // one per participant
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  householdId: string;
  fromUserId: string;  // who paid
  toUserId: string;    // who received
  amount: number;
  note: string;
  createdBy: string;
  createdAt: string;
}

/** Simplified debt: fromUserId owes toUserId this amount */
export interface BalancePair {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export interface ExpenseState {
  expenses: Expense[];
  settlements: Settlement[];
  isLoading: boolean;
}

// ── Payloads ─────────────────────────────────────────────────────────────────

export interface SplitInput {
  userId: string;
  amount: number;
  percentage: number;
}

export interface AddExpensePayload {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paidBy: string;
  splitType: SplitType;
  splits: SplitInput[];
  notes: string;
}

export interface UpdateExpensePayload extends AddExpensePayload {}

export interface AddSettlementPayload {
  fromUserId: string;
  toUserId: string;
  amount: number;
  note: string;
}
