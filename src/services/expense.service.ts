import type {
  AddExpensePayload,
  AddSettlementPayload,
  BalancePair,
  Expense,
  Settlement,
  UpdateExpensePayload,
} from "../types/expense.types";
import { api } from "./api.client";

// Tracked so that expense-only operations (update, delete) can build the URL.
// Always set by getExpenses/addExpense which are called before any mutation.
let activeHouseholdId = "";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Returns net balance per userId. Positive = owed money. Negative = owes money. */
export function computeNetBalances(
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const net: Record<string, number> = {};

  for (const exp of expenses) {
    for (const split of exp.splits) {
      if (split.userId !== exp.paidBy) {
        net[split.userId] = round2((net[split.userId] ?? 0) - split.amount);
        net[exp.paidBy]   = round2((net[exp.paidBy]   ?? 0) + split.amount);
      }
    }
  }

  for (const s of settlements) {
    net[s.fromUserId] = round2((net[s.fromUserId] ?? 0) + s.amount);
    net[s.toUserId]   = round2((net[s.toUserId]   ?? 0) - s.amount);
  }

  return net;
}

/**
 * Greedy debt simplification: given a net balance map, returns the minimum
 * number of transfers needed to settle all debts.
 */
export function simplifyDebts(net: Record<string, number>): BalancePair[] {
  const debtors   = Object.entries(net).filter(([, v]) => v < -0.01).map(([id, v]) => ({ id, amount: -v })).sort((a, b) => b.amount - a.amount);
  const creditors = Object.entries(net).filter(([, v]) => v >  0.01).map(([id, v]) => ({ id, amount: v })).sort((a, b) => b.amount - a.amount);

  const result: BalancePair[] = [];
  let di = 0, ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const d = debtors[di];
    const c = creditors[ci];
    const settled = Math.min(d.amount, c.amount);
    if (settled > 0.01) {
      result.push({ fromUserId: d.id, toUserId: c.id, amount: round2(settled) });
    }
    d.amount = round2(d.amount - settled);
    c.amount = round2(c.amount - settled);
    if (d.amount < 0.01) di++;
    if (c.amount < 0.01) ci++;
  }

  return result;
}

export const expenseService = {
  async getExpenses(householdId: string): Promise<Expense[]> {
    activeHouseholdId = householdId;
    const data = await api.get<{ expenses: Expense[] }>(`/households/${householdId}/expenses`);
    return data.expenses;
  },

  async getSettlements(householdId: string): Promise<Settlement[]> {
    const data = await api.get<{ settlements: Settlement[] }>(`/households/${householdId}/expenses/settlements`);
    return data.settlements;
  },

  async addExpense(
    householdId: string,
    _userId: string,
    payload: AddExpensePayload
  ): Promise<Expense> {
    activeHouseholdId = householdId;
    const data = await api.post<{ expense: Expense }>(`/households/${householdId}/expenses`, payload);
    return data.expense;
  },

  async updateExpense(expenseId: string, payload: UpdateExpensePayload): Promise<Expense> {
    const data = await api.patch<{ expense: Expense }>(
      `/households/${activeHouseholdId}/expenses/${expenseId}`,
      payload
    );
    return data.expense;
  },

  async deleteExpense(expenseId: string): Promise<void> {
    await api.delete(`/households/${activeHouseholdId}/expenses/${expenseId}`);
  },

  async recordSettlement(
    householdId: string,
    _userId: string,
    payload: AddSettlementPayload
  ): Promise<Settlement> {
    const data = await api.post<{ settlement: Settlement }>(
      `/households/${householdId}/expenses/settlements`,
      payload
    );
    return data.settlement;
  },
};
