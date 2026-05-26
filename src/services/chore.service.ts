import type {
  AddChorePayload,
  Chore,
  ChoreCompletionLog,
  ChoreFrequency,
  UpdateChorePayload,
} from "../types/chore.types";
import { api } from "./api.client";

// Tracked so that chore-only operations (update, delete, undo) can build the URL.
// Always set by getChores/addChore/markComplete which are called before any mutation.
let activeHouseholdId = "";

export function getFrequencyDays(frequency: ChoreFrequency): number {
  switch (frequency) {
    case "Daily":      return 1;
    case "Every2Days": return 2;
    case "Every3Days": return 3;
    case "Weekly":     return 7;
    case "Biweekly":   return 14;
    case "Monthly":    return 30;
  }
}

export const choreService = {
  async getChores(householdId: string): Promise<Chore[]> {
    activeHouseholdId = householdId;
    const data = await api.get<{ chores: Chore[] }>(`/households/${householdId}/chores`);
    return data.chores;
  },

  async getCompletions(householdId: string): Promise<ChoreCompletionLog[]> {
    activeHouseholdId = householdId;
    const data = await api.get<{ completions: ChoreCompletionLog[] }>(
      `/households/${householdId}/chores/completions`
    );
    return data.completions;
  },

  async addChore(
    householdId: string,
    _userId: string,
    payload: AddChorePayload
  ): Promise<Chore> {
    activeHouseholdId = householdId;
    const data = await api.post<{ chore: Chore }>(`/households/${householdId}/chores`, payload);
    return data.chore;
  },

  async updateChore(choreId: string, payload: UpdateChorePayload): Promise<Chore> {
    const data = await api.patch<{ chore: Chore }>(
      `/households/${activeHouseholdId}/chores/${choreId}`,
      payload
    );
    return data.chore;
  },

  async markComplete(
    choreId: string,
    _userId: string,
    householdId: string
  ): Promise<{ chore: Chore; log: ChoreCompletionLog }> {
    activeHouseholdId = householdId;
    const data = await api.post<{ chore: Chore; log: ChoreCompletionLog }>(
      `/households/${householdId}/chores/${choreId}/complete`
    );
    return data;
  },

  async undoComplete(
    choreId: string,
    logId: string
  ): Promise<{ chore: Chore; removedLogId: string }> {
    const data = await api.delete<{ chore: Chore; removedLogId: string }>(
      `/households/${activeHouseholdId}/chores/${choreId}/completions/${logId}`
    );
    return data;
  },

  async deleteChore(choreId: string): Promise<void> {
    await api.delete(`/households/${activeHouseholdId}/chores/${choreId}`);
  },

  removeMemberFromChores(_householdId: string, _userId: string): void {
    // Server handles cascade cleanup when a member is removed or leaves
  },
};
