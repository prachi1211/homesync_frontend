import type {
  CreateHouseholdPayload,
  Household,
  HouseholdMember,
  HouseholdSummary,
  JoinHouseholdPayload,
  UpdateHouseholdPayload,
} from "../types/household.types";
import { generateInviteCode } from "../utils/household.utils";

const HOUSEHOLDS_KEY = "homesync_households";
const MEMBERSHIPS_KEY = "homesync_memberships";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return crypto.randomUUID();
}

// ── Storage helpers ───────────────────────────────────────────────────────────

function getHouseholds(): Household[] {
  try {
    return JSON.parse(localStorage.getItem(HOUSEHOLDS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHouseholds(households: Household[]): void {
  localStorage.setItem(HOUSEHOLDS_KEY, JSON.stringify(households));
}

function getMemberships(): HouseholdMember[] {
  try {
    return JSON.parse(localStorage.getItem(MEMBERSHIPS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveMemberships(memberships: HouseholdMember[]): void {
  localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
}

// ── Public service ────────────────────────────────────────────────────────────

export const householdService = {
  async createHousehold(
    userId: string,
    userName: string,
    payload: CreateHouseholdPayload
  ): Promise<Household> {
    await delay(800);

    const name = payload.name.trim();
    if (!name) throw new Error("Household name is required");
    if (name.length < 2) throw new Error("Name must be at least 2 characters");
    if (name.length > 50) throw new Error("Name must be 50 characters or fewer");

    const household: Household = {
      id: generateId(),
      name,
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
      archivedAt: null,
      memberCount: 1,
    };

    const member: HouseholdMember = {
      id: generateId(),
      userId,
      userName,
      userAvatarUrl: null,
      role: "owner",
      joinedAt: new Date().toISOString(),
    };

    const households = getHouseholds();
    households.push(household);
    saveHouseholds(households);

    const memberships = getMemberships();
    memberships.push({ ...member, id: `${household.id}:${member.id}` });
    saveMemberships(memberships);

    return household;
  },

  async joinHousehold(
    userId: string,
    userName: string,
    payload: JoinHouseholdPayload
  ): Promise<Household> {
    await delay(800);

    const code = payload.code.trim().toUpperCase();
    const households = getHouseholds();
    const household = households.find(
      (h) => h.inviteCode === code && !h.archivedAt
    );

    if (!household) throw new Error("Invalid invite code. Check the code and try again.");

    const memberships = getMemberships();
    const alreadyMember = memberships.some(
      (m) => m.userId === userId && m.id.startsWith(household.id + ":")
    );
    if (alreadyMember) throw new Error("You are already a member of this household.");

    const member: HouseholdMember = {
      id: `${household.id}:${generateId()}`,
      userId,
      userName,
      userAvatarUrl: null,
      role: "member",
      joinedAt: new Date().toISOString(),
    };
    memberships.push(member);
    saveMemberships(memberships);

    household.memberCount = memberships.filter((m) =>
      m.id.startsWith(household.id + ":")
    ).length;
    saveHouseholds(households);

    return household;
  },

  async getUserHouseholds(userId: string): Promise<HouseholdSummary[]> {
    await delay(300);

    const memberships = getMemberships();
    const households = getHouseholds();

    return memberships
      .filter((m) => m.userId === userId)
      .map((m) => {
        const householdId = m.id.split(":")[0];
        const household = households.find((h) => h.id === householdId);
        if (!household || household.archivedAt) return null;
        return {
          id: household.id,
          name: household.name,
          role: m.role,
          memberCount: household.memberCount,
        } satisfies HouseholdSummary;
      })
      .filter((s): s is HouseholdSummary => s !== null);
  },

  async getHousehold(householdId: string): Promise<Household> {
    await delay(200);
    const household = getHouseholds().find((h) => h.id === householdId);
    if (!household) throw new Error("Household not found");
    return household;
  },

  async getMembers(householdId: string): Promise<HouseholdMember[]> {
    await delay(300);
    return getMemberships().filter((m) => m.id.startsWith(householdId + ":"));
  },

  async updateHousehold(
    householdId: string,
    userId: string,
    payload: UpdateHouseholdPayload
  ): Promise<Household> {
    await delay(600);

    const memberships = getMemberships();
    const isMember = memberships.find(
      (m) => m.id.startsWith(householdId + ":") && m.userId === userId
    );
    if (!isMember || isMember.role !== "owner")
      throw new Error("Only the owner can update the household name.");

    const name = payload.name.trim();
    if (!name) throw new Error("Household name is required");

    const households = getHouseholds();
    const idx = households.findIndex((h) => h.id === householdId);
    if (idx === -1) throw new Error("Household not found");

    households[idx] = { ...households[idx], name };
    saveHouseholds(households);
    return households[idx];
  },

  async removeMember(
    householdId: string,
    actorUserId: string,
    targetUserId: string
  ): Promise<void> {
    await delay(600);

    const memberships = getMemberships();
    const actor = memberships.find(
      (m) => m.id.startsWith(householdId + ":") && m.userId === actorUserId
    );
    if (!actor || actor.role !== "owner")
      throw new Error("Only the owner can remove members.");

    const targetIdx = memberships.findIndex(
      (m) => m.id.startsWith(householdId + ":") && m.userId === targetUserId
    );
    if (targetIdx === -1) throw new Error("Member not found");
    memberships.splice(targetIdx, 1);
    saveMemberships(memberships);

    const households = getHouseholds();
    const hIdx = households.findIndex((h) => h.id === householdId);
    if (hIdx !== -1) {
      households[hIdx].memberCount = memberships.filter((m) =>
        m.id.startsWith(householdId + ":")
      ).length;
      saveHouseholds(households);
    }
  },

  async transferOwnership(
    householdId: string,
    actorUserId: string,
    newOwnerId: string
  ): Promise<void> {
    await delay(600);

    const memberships = getMemberships();
    const actorIdx = memberships.findIndex(
      (m) => m.id.startsWith(householdId + ":") && m.userId === actorUserId
    );
    if (actorIdx === -1 || memberships[actorIdx].role !== "owner")
      throw new Error("Only the owner can transfer ownership.");

    const newOwnerIdx = memberships.findIndex(
      (m) => m.id.startsWith(householdId + ":") && m.userId === newOwnerId
    );
    if (newOwnerIdx === -1) throw new Error("Target member not found.");

    memberships[actorIdx] = { ...memberships[actorIdx], role: "member" };
    memberships[newOwnerIdx] = { ...memberships[newOwnerIdx], role: "owner" };
    saveMemberships(memberships);
  },

  async leaveHousehold(householdId: string, userId: string): Promise<void> {
    await delay(600);

    const memberships = getMemberships();
    const member = memberships.find(
      (m) => m.id.startsWith(householdId + ":") && m.userId === userId
    );
    if (!member) throw new Error("You are not a member of this household.");
    if (member.role === "owner")
      throw new Error(
        "Owners cannot leave. Transfer ownership first or delete the household."
      );

    const filtered = memberships.filter(
      (m) => !(m.id.startsWith(householdId + ":") && m.userId === userId)
    );
    saveMemberships(filtered);

    const households = getHouseholds();
    const hIdx = households.findIndex((h) => h.id === householdId);
    if (hIdx !== -1) {
      households[hIdx].memberCount = filtered.filter((m) =>
        m.id.startsWith(householdId + ":")
      ).length;
      saveHouseholds(households);
    }
  },

  async deleteHousehold(householdId: string, userId: string): Promise<void> {
    await delay(800);

    const memberships = getMemberships();
    const member = memberships.find(
      (m) => m.id.startsWith(householdId + ":") && m.userId === userId
    );
    if (!member || member.role !== "owner")
      throw new Error("Only the owner can delete the household.");

    const households = getHouseholds();
    const filtered = households.filter((h) => h.id !== householdId);
    saveHouseholds(filtered);

    saveMemberships(
      memberships.filter((m) => !m.id.startsWith(householdId + ":"))
    );
  },

  async regenerateInviteCode(
    householdId: string,
    userId: string
  ): Promise<string> {
    await delay(500);

    const memberships = getMemberships();
    const member = memberships.find(
      (m) => m.id.startsWith(householdId + ":") && m.userId === userId
    );
    if (!member || member.role !== "owner")
      throw new Error("Only the owner can regenerate the invite code.");

    const households = getHouseholds();
    const idx = households.findIndex((h) => h.id === householdId);
    if (idx === -1) throw new Error("Household not found");

    const newCode = generateInviteCode();
    households[idx] = { ...households[idx], inviteCode: newCode };
    saveHouseholds(households);
    return newCode;
  },

  async getHouseholdByCode(code: string): Promise<Household | null> {
    await delay(400);
    const normalised = code.trim().toUpperCase();
    return (
      getHouseholds().find(
        (h) => h.inviteCode === normalised && !h.archivedAt
      ) ?? null
    );
  },
};
