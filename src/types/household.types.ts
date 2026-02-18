export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  archivedAt: string | null;
  memberCount: number;
}

export interface HouseholdMember {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  role: "owner" | "member";
  joinedAt: string;
}

export interface HouseholdSummary {
  id: string;
  name: string;
  role: "owner" | "member";
  memberCount: number;
}

export interface HouseholdState {
  households: HouseholdSummary[];
  activeHousehold: Household | null;
  members: HouseholdMember[];
  isLoading: boolean;
  isSinglePersonMode: boolean;
}

export interface CreateHouseholdPayload {
  name: string;
}

export interface JoinHouseholdPayload {
  code: string;
}

export interface UpdateHouseholdPayload {
  name: string;
}

export interface TransferOwnershipPayload {
  newOwnerId: string;
}
