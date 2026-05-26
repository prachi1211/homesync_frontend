import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AddGroceryPayload,
  GroceryState,
  UpdateGroceryPayload,
} from "../types/grocery.types";
import { groceryService } from "../services/grocery.service";
import { useAuth } from "./AuthContext";
import { useHousehold } from "./HouseholdContext";

interface GroceryContextValue extends GroceryState {
  addItem: (payload: AddGroceryPayload) => Promise<void>;
  updateItem: (itemId: string, payload: UpdateGroceryPayload) => Promise<void>;
  toggleBought: (itemId: string) => Promise<void>;
  toggleStarred: (itemId: string) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  clearBought: () => Promise<void>;
}

const GroceryContext = createContext<GroceryContextValue | null>(null);

const INITIAL_STATE: GroceryState = { items: [], isLoading: false };

export function GroceryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { activeHousehold } = useHousehold();
  const [state, setState] = useState<GroceryState>(INITIAL_STATE);

  useEffect(() => {
    if (!activeHousehold) {
      setState(INITIAL_STATE);
      return;
    }

    let cancelled = false;

    async function load() {
      setState({ items: [], isLoading: true });
      try {
        const items = await groceryService.getItems(activeHousehold!.id);
        if (!cancelled) setState({ items, isLoading: false });
      } catch {
        if (!cancelled) setState({ items: [], isLoading: false });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeHousehold]);

  const addItem = useCallback(
    async (payload: AddGroceryPayload) => {
      if (!user || !activeHousehold) throw new Error("No active household");
      const item = await groceryService.addItem(activeHousehold.id, user.id, payload);
      setState((prev) => ({ ...prev, items: [...prev.items, item] }));
    },
    [user, activeHousehold]
  );

  const updateItem = useCallback(
    async (itemId: string, payload: UpdateGroceryPayload) => {
      const updated = await groceryService.updateItem(itemId, payload);
      setState((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === itemId ? updated : i)),
      }));
    },
    []
  );

  const toggleBought = useCallback(async (itemId: string) => {
    const updated = await groceryService.toggleBought(itemId);
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? updated : i)),
    }));
  }, []);

  const toggleStarred = useCallback(async (itemId: string) => {
    const updated = await groceryService.toggleStarred(itemId);
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? updated : i)),
    }));
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    await groceryService.deleteItem(itemId);
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  }, []);

  const clearBought = useCallback(async () => {
    if (!activeHousehold) return;
    await groceryService.clearBought(activeHousehold.id);
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => !i.isBought),
    }));
  }, [activeHousehold]);

  return (
    <GroceryContext
      value={{ ...state, addItem, updateItem, toggleBought, toggleStarred, deleteItem, clearBought }}
    >
      {children}
    </GroceryContext>
  );
}

export function useGrocery(): GroceryContextValue {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error("useGrocery must be used within a GroceryProvider");
  }
  return context;
}
