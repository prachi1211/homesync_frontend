import type {
  CreateHouseholdPayload,
  Household,
  HouseholdMember,
  HouseholdSummary,
  JoinHouseholdPayload,
  UpdateHouseholdPayload,
} from "../types/household.types";
import { api } from "./api.client";

export const householdService = {
  async createHousehold(
    _userId: string,
    _userName: string,
    payload: CreateHouseholdPayload
  ): Promise<Household> {
    const data = await api.post<{ household: Household }>("/households", { name: payload.name });
    return data.household;
  },

  async joinHousehold(
    _userId: string,
    _userName: string,
    payload: JoinHouseholdPayload
  ): Promise<Household> {
    const data = await api.post<{ household: Household }>("/households/join", { code: payload.code });
    return data.household;
  },

  async getUserHouseholds(_userId: string): Promise<HouseholdSummary[]> {
    const data = await api.get<{ households: HouseholdSummary[] }>("/households");
    return data.households;
  },

  async getHousehold(householdId: string): Promise<Household> {
    const data = await api.get<{ household: Household }>(`/households/${householdId}`);
    return data.household;
  },

  async getMembers(householdId: string): Promise<HouseholdMember[]> {
    const data = await api.get<{ members: HouseholdMember[] }>(`/households/${householdId}/members`);
    return data.members;
  },

  async updateHousehold(
    householdId: string,
    _userId: string,
    payload: UpdateHouseholdPayload
  ): Promise<Household> {
    const data = await api.patch<{ household: Household }>(`/households/${householdId}`, { name: payload.name });
    return data.household;
  },

  async removeMember(
    householdId: string,
    _actorUserId: string,
    targetUserId: string
  ): Promise<void> {
    await api.delete(`/households/${householdId}/members/${targetUserId}`);
  },

  async transferOwnership(
    householdId: string,
    _actorUserId: string,
    newOwnerId: string
  ): Promise<void> {
    await api.post(`/households/${householdId}/transfer-ownership`, { newOwnerId });
  },

  async leaveHousehold(householdId: string, _userId: string): Promise<void> {
    await api.post(`/households/${householdId}/leave`);
  },

  async deleteHousehold(householdId: string, _userId: string): Promise<void> {
    await api.delete(`/households/${householdId}`);
  },

  async regenerateInviteCode(householdId: string, _userId: string): Promise<string> {
    const data = await api.post<{ inviteCode: string }>(`/households/${householdId}/regenerate-code`);
    return data.inviteCode;
  },

  async changeRole(
    householdId: string,
    _actorUserId: string,
    targetUserId: string,
    newRole: "owner" | "member"
  ): Promise<void> {
    await api.patch(`/households/${householdId}/members/${targetUserId}/role`, { role: newRole });
  },

  async getHouseholdByCode(code: string): Promise<Household | null> {
    const data = await api.get<{ household: Household | null }>(
      `/households/by-code?code=${encodeURIComponent(code.toUpperCase())}`
    );
    return data.household;
  },
};
