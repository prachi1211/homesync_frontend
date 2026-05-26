import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AddChorePayload, ChoreState, UpdateChorePayload } from "../types/chore.types";
import { choreService } from "../services/chore.service";
import { useAuth } from "./AuthContext";
import { useHousehold } from "./HouseholdContext";

interface ChoreContextValue extends ChoreState {
  addChore: (payload: AddChorePayload) => Promise<void>;
  updateChore: (choreId: string, payload: UpdateChorePayload) => Promise<void>;
  markComplete: (choreId: string) => Promise<void>;
  undoComplete: (choreId: string, logId: string) => Promise<void>;
  deleteChore: (choreId: string) => Promise<void>;
}

const ChoreContext = createContext<ChoreContextValue | null>(null);

const INITIAL_STATE: ChoreState = { chores: [], completions: [], isLoading: false };

export function ChoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { activeHousehold } = useHousehold();
  const [state, setState] = useState<ChoreState>(INITIAL_STATE);

  useEffect(() => {
    if (!activeHousehold) {
      setState(INITIAL_STATE);
      return;
    }

    let cancelled = false;

    async function load() {
      setState({ chores: [], completions: [], isLoading: true });
      try {
        const [chores, completions] = await Promise.all([
          choreService.getChores(activeHousehold!.id),
          choreService.getCompletions(activeHousehold!.id),
        ]);
        if (!cancelled) setState({ chores, completions, isLoading: false });
      } catch {
        if (!cancelled) setState({ chores: [], completions: [], isLoading: false });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeHousehold]);

  const addChore = useCallback(
    async (payload: AddChorePayload) => {
      if (!user || !activeHousehold) throw new Error("No active household");
      const chore = await choreService.addChore(activeHousehold.id, user.id, payload);
      setState((prev) => ({ ...prev, chores: [...prev.chores, chore] }));
    },
    [user, activeHousehold]
  );

  const updateChore = useCallback(async (choreId: string, payload: UpdateChorePayload) => {
    const updated = await choreService.updateChore(choreId, payload);
    setState((prev) => ({
      ...prev,
      chores: prev.chores.map((c) => (c.id === choreId ? updated : c)),
    }));
  }, []);

  const markComplete = useCallback(
    async (choreId: string) => {
      if (!user || !activeHousehold) throw new Error("No active household");
      const { chore, log } = await choreService.markComplete(
        choreId,
        user.id,
        activeHousehold.id
      );
      setState((prev) => ({
        ...prev,
        chores: prev.chores.map((c) => (c.id === choreId ? chore : c)),
        completions: [...prev.completions, log],
      }));
    },
    [user, activeHousehold]
  );

  const undoComplete = useCallback(async (choreId: string, logId: string) => {
    const { chore, removedLogId } = await choreService.undoComplete(choreId, logId);
    setState((prev) => ({
      ...prev,
      chores: prev.chores.map((c) => (c.id === choreId ? chore : c)),
      completions: prev.completions.filter((c) => c.id !== removedLogId),
    }));
  }, []);

  const deleteChore = useCallback(async (choreId: string) => {
    await choreService.deleteChore(choreId);
    setState((prev) => ({
      ...prev,
      chores: prev.chores.filter((c) => c.id !== choreId),
    }));
  }, []);

  return (
    <ChoreContext
      value={{ ...state, addChore, updateChore, markComplete, undoComplete, deleteChore }}
    >
      {children}
    </ChoreContext>
  );
}

export function useChore(): ChoreContextValue {
  const context = useContext(ChoreContext);
  if (!context) throw new Error("useChore must be used within a ChoreProvider");
  return context;
}
