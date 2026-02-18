import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  CreateHouseholdPayload,
  Household,
  HouseholdMember,
  HouseholdState,
  HouseholdSummary,
  JoinHouseholdPayload,
  UpdateHouseholdPayload,
} from "../types/household.types";
import { householdService } from "../services/household.service";
import { useAuth } from "./AuthContext";

const ACTIVE_HOUSEHOLD_KEY = "homesync_active_household";

interface HouseholdContextValue extends HouseholdState {
  createHousehold: (payload: CreateHouseholdPayload) => Promise<Household>;
  joinHousehold: (payload: JoinHouseholdPayload) => Promise<Household>;
  setActiveHousehold: (id: string) => Promise<void>;
  refreshHouseholds: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  updateHousehold: (payload: UpdateHouseholdPayload) => Promise<void>;
  removeMember: (targetUserId: string) => Promise<void>;
  transferOwnership: (newOwnerId: string) => Promise<void>;
  leaveHousehold: () => Promise<void>;
  deleteHousehold: () => Promise<void>;
  regenerateInviteCode: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

const INITIAL_STATE: HouseholdState = {
  households: [],
  activeHousehold: null,
  members: [],
  isLoading: true,
  isSinglePersonMode: false,
};

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<HouseholdState>(INITIAL_STATE);

  // ── Load households when user authenticates ──────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      // Keep isLoading: true so the next login cycle doesn't see stale
      // households: [] before the reload effect fires.
      setState(INITIAL_STATE);
      localStorage.removeItem(ACTIVE_HOUSEHOLD_KEY);
      return;
    }

    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const summaries = await householdService.getUserHouseholds(user!.id);

        if (cancelled) return;

        let activeHousehold: Household | null = null;
        let members: HouseholdMember[] = [];

        const savedId = localStorage.getItem(ACTIVE_HOUSEHOLD_KEY);
        const restoredSummary = savedId
          ? summaries.find((s) => s.id === savedId)
          : null;
        const targetId = restoredSummary
          ? restoredSummary.id
          : summaries[0]?.id;

        if (targetId) {
          try {
            activeHousehold = await householdService.getHousehold(targetId);
            members = await householdService.getMembers(targetId);
            localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, targetId);
          } catch {
            activeHousehold = null;
          }
        }

        if (cancelled) return;

        setState({
          households: summaries,
          activeHousehold,
          members,
          isLoading: false,
          isSinglePersonMode: activeHousehold?.memberCount === 1,
        });
      } catch {
        if (!cancelled)
          setState({ ...INITIAL_STATE, isLoading: false });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading, user]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const refreshHouseholds = useCallback(async () => {
    if (!user) return;
    const summaries = await householdService.getUserHouseholds(user.id);
    setState((prev) => ({ ...prev, households: summaries }));
  }, [user]);

  const refreshMembers = useCallback(async () => {
    if (!state.activeHousehold) return;
    const members = await householdService.getMembers(state.activeHousehold.id);
    setState((prev) => ({ ...prev, members }));
  }, [state.activeHousehold]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const createHousehold = useCallback(
    async (payload: CreateHouseholdPayload): Promise<Household> => {
      if (!user) throw new Error("Not authenticated");
      const household = await householdService.createHousehold(
        user.id,
        user.name,
        payload
      );
      const members = await householdService.getMembers(household.id);
      const summaries = await householdService.getUserHouseholds(user.id);
      localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, household.id);
      setState({
        households: summaries,
        activeHousehold: household,
        members,
        isLoading: false,
        isSinglePersonMode: household.memberCount === 1,
      });
      return household;
    },
    [user]
  );

  const joinHousehold = useCallback(
    async (payload: JoinHouseholdPayload): Promise<Household> => {
      if (!user) throw new Error("Not authenticated");
      const household = await householdService.joinHousehold(
        user.id,
        user.name,
        payload
      );
      const members = await householdService.getMembers(household.id);
      const summaries = await householdService.getUserHouseholds(user.id);
      localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, household.id);
      setState({
        households: summaries,
        activeHousehold: household,
        members,
        isLoading: false,
        isSinglePersonMode: household.memberCount === 1,
      });
      return household;
    },
    [user]
  );

  const setActiveHousehold = useCallback(
    async (id: string) => {
      const household = await householdService.getHousehold(id);
      const members = await householdService.getMembers(id);
      localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, id);
      setState((prev) => ({
        ...prev,
        activeHousehold: household,
        members,
        isSinglePersonMode: household.memberCount === 1,
      }));
    },
    []
  );

  const updateHousehold = useCallback(
    async (payload: UpdateHouseholdPayload) => {
      if (!user || !state.activeHousehold) throw new Error("No active household");
      const updated = await householdService.updateHousehold(
        state.activeHousehold.id,
        user.id,
        payload
      );
      setState((prev) => ({
        ...prev,
        activeHousehold: updated,
        households: prev.households.map((s) =>
          s.id === updated.id ? { ...s, name: updated.name } : s
        ),
      }));
    },
    [user, state.activeHousehold]
  );

  const removeMember = useCallback(
    async (targetUserId: string) => {
      if (!user || !state.activeHousehold) throw new Error("No active household");
      await householdService.removeMember(
        state.activeHousehold.id,
        user.id,
        targetUserId
      );
      const [updated, members, summaries] = await Promise.all([
        householdService.getHousehold(state.activeHousehold.id),
        householdService.getMembers(state.activeHousehold.id),
        householdService.getUserHouseholds(user.id),
      ]);
      setState((prev) => ({
        ...prev,
        activeHousehold: updated,
        members,
        households: summaries,
        isSinglePersonMode: updated.memberCount === 1,
      }));
    },
    [user, state.activeHousehold]
  );

  const transferOwnership = useCallback(
    async (newOwnerId: string) => {
      if (!user || !state.activeHousehold) throw new Error("No active household");
      await householdService.transferOwnership(
        state.activeHousehold.id,
        user.id,
        newOwnerId
      );
      const [members, summaries] = await Promise.all([
        householdService.getMembers(state.activeHousehold.id),
        householdService.getUserHouseholds(user.id),
      ]);
      setState((prev) => ({
        ...prev,
        members,
        households: summaries,
      }));
    },
    [user, state.activeHousehold]
  );

  const leaveHousehold = useCallback(async () => {
    if (!user || !state.activeHousehold) throw new Error("No active household");
    await householdService.leaveHousehold(state.activeHousehold.id, user.id);
    const summaries = await householdService.getUserHouseholds(user.id);

    if (summaries.length === 0) {
      localStorage.removeItem(ACTIVE_HOUSEHOLD_KEY);
      setState({
        households: [],
        activeHousehold: null,
        members: [],
        isLoading: false,
        isSinglePersonMode: false,
      });
      return;
    }

    const nextId = summaries[0].id;
    const [nextHousehold, nextMembers] = await Promise.all([
      householdService.getHousehold(nextId),
      householdService.getMembers(nextId),
    ]);
    localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, nextId);
    setState({
      households: summaries,
      activeHousehold: nextHousehold,
      members: nextMembers,
      isLoading: false,
      isSinglePersonMode: nextHousehold.memberCount === 1,
    });
  }, [user, state.activeHousehold]);

  const deleteHousehold = useCallback(async () => {
    if (!user || !state.activeHousehold) throw new Error("No active household");
    await householdService.deleteHousehold(state.activeHousehold.id, user.id);
    const summaries = await householdService.getUserHouseholds(user.id);

    if (summaries.length === 0) {
      localStorage.removeItem(ACTIVE_HOUSEHOLD_KEY);
      setState({
        households: [],
        activeHousehold: null,
        members: [],
        isLoading: false,
        isSinglePersonMode: false,
      });
      return;
    }

    const nextId = summaries[0].id;
    const [nextHousehold, nextMembers] = await Promise.all([
      householdService.getHousehold(nextId),
      householdService.getMembers(nextId),
    ]);
    localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, nextId);
    setState({
      households: summaries,
      activeHousehold: nextHousehold,
      members: nextMembers,
      isLoading: false,
      isSinglePersonMode: nextHousehold.memberCount === 1,
    });
  }, [user, state.activeHousehold]);

  const regenerateInviteCode = useCallback(async () => {
    if (!user || !state.activeHousehold) throw new Error("No active household");
    const newCode = await householdService.regenerateInviteCode(
      state.activeHousehold.id,
      user.id
    );
    setState((prev) =>
      prev.activeHousehold
        ? {
            ...prev,
            activeHousehold: { ...prev.activeHousehold, inviteCode: newCode },
          }
        : prev
    );
  }, [user, state.activeHousehold]);

  // ── Helpers: derive summaries from active household ──────────────────────
  const activeSummary: HouseholdSummary | undefined = state.households.find(
    (s) => s.id === state.activeHousehold?.id
  );
  const enrichedState: HouseholdState = {
    ...state,
    isSinglePersonMode: state.activeHousehold?.memberCount === 1,
  };

  void activeSummary; // suppress unused warning

  return (
    <HouseholdContext
      value={{
        ...enrichedState,
        createHousehold,
        joinHousehold,
        setActiveHousehold,
        refreshHouseholds,
        refreshMembers,
        updateHousehold,
        removeMember,
        transferOwnership,
        leaveHousehold,
        deleteHousehold,
        regenerateInviteCode,
      }}
    >
      {children}
    </HouseholdContext>
  );
}

export function useHousehold(): HouseholdContextValue {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return context;
}
