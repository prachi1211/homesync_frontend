import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AddExpensePayload,
  AddSettlementPayload,
  ExpenseState,
  UpdateExpensePayload,
} from "../types/expense.types";
import { expenseService } from "../services/expense.service";
import { useAuth } from "./AuthContext";
import { useHousehold } from "./HouseholdContext";

interface ExpenseContextValue extends ExpenseState {
  addExpense:       (payload: AddExpensePayload)             => Promise<void>;
  updateExpense:    (id: string, payload: UpdateExpensePayload) => Promise<void>;
  deleteExpense:    (id: string)                             => Promise<void>;
  recordSettlement: (payload: AddSettlementPayload)          => Promise<void>;
  refreshExpenses:  ()                                       => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

const INITIAL_STATE: ExpenseState = { expenses: [], settlements: [], isLoading: false };

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { activeHousehold } = useHousehold();
  const [state, setState] = useState<ExpenseState>(INITIAL_STATE);

  useEffect(() => {
    if (!activeHousehold) {
      setState(INITIAL_STATE);
      return;
    }

    let cancelled = false;

    async function load() {
      setState({ expenses: [], settlements: [], isLoading: true });
      try {
        const [expenses, settlements] = await Promise.all([
          expenseService.getExpenses(activeHousehold!.id),
          expenseService.getSettlements(activeHousehold!.id),
        ]);
        if (!cancelled) setState({ expenses, settlements, isLoading: false });
      } catch {
        if (!cancelled) setState(INITIAL_STATE);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeHousehold]);

  const refreshExpenses = useCallback(async () => {
    if (!activeHousehold) return;
    const [expenses, settlements] = await Promise.all([
      expenseService.getExpenses(activeHousehold.id),
      expenseService.getSettlements(activeHousehold.id),
    ]);
    setState((prev) => ({ ...prev, expenses, settlements }));
  }, [activeHousehold]);

  const addExpense = useCallback(async (payload: AddExpensePayload) => {
    if (!user || !activeHousehold) throw new Error("No active household");
    const expense = await expenseService.addExpense(activeHousehold.id, user.id, payload);
    setState((prev) => ({ ...prev, expenses: [expense, ...prev.expenses] }));
  }, [user, activeHousehold]);

  const updateExpense = useCallback(async (id: string, payload: UpdateExpensePayload) => {
    const updated = await expenseService.updateExpense(id, payload);
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? updated : e)),
    }));
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await expenseService.deleteExpense(id);
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const recordSettlement = useCallback(async (payload: AddSettlementPayload) => {
    if (!user || !activeHousehold) throw new Error("No active household");
    const settlement = await expenseService.recordSettlement(activeHousehold.id, user.id, payload);
    setState((prev) => ({
      ...prev,
      settlements: [...prev.settlements, settlement],
    }));
  }, [user, activeHousehold]);

  return (
    <ExpenseContext
      value={{ ...state, addExpense, updateExpense, deleteExpense, recordSettlement, refreshExpenses }}
    >
      {children}
    </ExpenseContext>
  );
}

export function useExpense(): ExpenseContextValue {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error("useExpense must be used within an ExpenseProvider");
  return context;
}
