export type Priority = "High" | "Medium" | "Low";
export type StatusFilter = "All" | "Unbought" | "Bought";
export type PriorityFilter = "All" | "High" | "Medium" | "Low";

export interface GroceryItem {
  id: string;
  householdId: string;
  name: string;
  qty: number;
  category: string;
  priority: Priority | null;
  isBought: boolean;
  boughtAt: string | null;
  starred: boolean;
  notes: string;
  addedBy: string;
  createdAt: string;
}

export interface GroceryState {
  items: GroceryItem[];
  isLoading: boolean;
}

export interface AddGroceryPayload {
  name: string;
  qty: number;
  category: string;
  priority: Priority | null;
  notes: string;
}

export interface UpdateGroceryPayload {
  name: string;
  qty: number;
  category: string;
  priority: Priority | null;
  notes: string;
}
