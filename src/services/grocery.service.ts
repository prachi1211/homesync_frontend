import type { AddGroceryPayload, GroceryItem, UpdateGroceryPayload } from "../types/grocery.types";

const GROCERIES_KEY = "homesync_groceries";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return crypto.randomUUID();
}

function normalizeItem(raw: Partial<GroceryItem> & { id: string }): GroceryItem {
  return {
    id: raw.id,
    householdId: raw.householdId ?? "",
    name: raw.name ?? "",
    qty: raw.qty ?? 1,
    category: raw.category ?? "Other",
    priority: raw.priority ?? null,
    isBought: raw.isBought ?? false,
    boughtAt: raw.boughtAt ?? null,
    starred: raw.starred ?? false,
    notes: raw.notes ?? "",
    addedBy: raw.addedBy ?? "",
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

function getAllItems(): GroceryItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(GROCERIES_KEY) ?? "[]") as Partial<GroceryItem & { id: string }>[];
    return raw.filter((i) => !!i.id).map((i) => normalizeItem(i as Partial<GroceryItem> & { id: string }));
  } catch {
    return [];
  }
}

function saveAllItems(items: GroceryItem[]): void {
  localStorage.setItem(GROCERIES_KEY, JSON.stringify(items));
}

export const groceryService = {
  async getItems(householdId: string): Promise<GroceryItem[]> {
    await delay(300);
    return getAllItems().filter((i) => i.householdId === householdId);
  },

  async addItem(
    householdId: string,
    userId: string,
    payload: AddGroceryPayload
  ): Promise<GroceryItem> {
    await delay(400);

    const name = payload.name.trim();
    if (!name) throw new Error("Item name is required");
    if (name.length > 60) throw new Error("Item name must be 60 characters or fewer");

    const item: GroceryItem = {
      id: generateId(),
      householdId,
      name,
      qty: Math.max(1, payload.qty),
      category: payload.category,
      priority: payload.priority,
      isBought: false,
      boughtAt: null,
      starred: false,
      notes: (payload.notes ?? "").trim(),
      addedBy: userId,
      createdAt: new Date().toISOString(),
    };

    const all = getAllItems();
    all.push(item);
    saveAllItems(all);
    return item;
  },

  async toggleBought(itemId: string): Promise<GroceryItem> {
    await delay(150);
    const all = getAllItems();
    const idx = all.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error("Item not found");
    const nowBought = !all[idx].isBought;
    all[idx] = {
      ...all[idx],
      isBought: nowBought,
      boughtAt: nowBought ? new Date().toISOString() : null,
    };
    saveAllItems(all);
    return all[idx];
  },

  async toggleStarred(itemId: string): Promise<GroceryItem> {
    await delay(150);
    const all = getAllItems();
    const idx = all.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error("Item not found");
    all[idx] = { ...all[idx], starred: !all[idx].starred };
    saveAllItems(all);
    return all[idx];
  },

  async updateItem(itemId: string, payload: UpdateGroceryPayload): Promise<GroceryItem> {
    await delay(400);
    const name = payload.name.trim();
    if (!name) throw new Error("Item name is required");
    if (name.length > 60) throw new Error("Item name must be 60 characters or fewer");

    const all = getAllItems();
    const idx = all.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error("Item not found");

    all[idx] = {
      ...all[idx],
      name,
      qty: Math.max(1, payload.qty),
      category: payload.category,
      priority: payload.priority,
      notes: (payload.notes ?? "").trim(),
    };
    saveAllItems(all);
    return all[idx];
  },

  async deleteItem(itemId: string): Promise<void> {
    await delay(300);
    saveAllItems(getAllItems().filter((i) => i.id !== itemId));
  },

  async clearBought(householdId: string): Promise<void> {
    await delay(400);
    saveAllItems(
      getAllItems().filter((i) => !(i.householdId === householdId && i.isBought))
    );
  },
};
