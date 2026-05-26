import type { AddGroceryPayload, GroceryItem, UpdateGroceryPayload } from "../types/grocery.types";
import { api } from "./api.client";

// Tracked so that item-only operations (toggle, update, delete) can build the URL.
// Always set by getItems/addItem which are called before any mutation.
let activeHouseholdId = "";

export const groceryService = {
  async getItems(householdId: string): Promise<GroceryItem[]> {
    activeHouseholdId = householdId;
    const data = await api.get<{ items: GroceryItem[] }>(`/households/${householdId}/groceries`);
    return data.items;
  },

  async addItem(
    householdId: string,
    _userId: string,
    payload: AddGroceryPayload
  ): Promise<GroceryItem> {
    activeHouseholdId = householdId;
    const data = await api.post<{ item: GroceryItem }>(`/households/${householdId}/groceries`, payload);
    return data.item;
  },

  async toggleBought(itemId: string): Promise<GroceryItem> {
    const data = await api.post<{ item: GroceryItem }>(
      `/households/${activeHouseholdId}/groceries/${itemId}/toggle-bought`
    );
    return data.item;
  },

  async toggleStarred(itemId: string): Promise<GroceryItem> {
    const data = await api.post<{ item: GroceryItem }>(
      `/households/${activeHouseholdId}/groceries/${itemId}/toggle-starred`
    );
    return data.item;
  },

  async updateItem(itemId: string, payload: UpdateGroceryPayload): Promise<GroceryItem> {
    const data = await api.patch<{ item: GroceryItem }>(
      `/households/${activeHouseholdId}/groceries/${itemId}`,
      payload
    );
    return data.item;
  },

  async deleteItem(itemId: string): Promise<void> {
    await api.delete(`/households/${activeHouseholdId}/groceries/${itemId}`);
  },

  async clearBought(householdId: string): Promise<void> {
    await api.delete(`/households/${householdId}/groceries/clear-bought`);
  },
};
