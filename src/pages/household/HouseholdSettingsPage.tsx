import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ConfirmModal } from "../../components/ui/Modal";
import { MemberList } from "../../components/household/MemberList";
import { InviteCodeDisplay } from "../../components/household/InviteCodeDisplay";
import { HouseholdAvatar } from "../../components/household/HouseholdAvatar";
import { validateName } from "../../utils/validation";

export function HouseholdSettingsPage() {
  const { user } = useAuth();
  const {
    activeHousehold,
    members,
    updateHousehold,
    leaveHousehold,
    deleteHousehold,
  } = useHousehold();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(activeHousehold?.name ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  const [leaveModal, setLeaveModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!activeHousehold) {
    return (
      <div className="text-center py-20 text-charcoal-muted">
        No household selected.
      </div>
    );
  }

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === "owner";

  async function handleNameSave(e: FormEvent) {
    e.preventDefault();
    const err = validateName(nameValue);
    if (err) { setNameError(err); return; }

    setSavingName(true);
    try {
      await updateHousehold({ name: nameValue.trim() });
      addToast("success", "Household name updated");
      setEditingName(false);
    } catch (err) {
      addToast("error", "Update failed", (err as Error).message);
    } finally {
      setSavingName(false);
    }
  }

  async function handleLeave() {
    setActionLoading(true);
    try {
      await leaveHousehold();
      addToast("info", "You have left the household");
      navigate("/", { replace: true });
    } catch (err) {
      addToast("error", "Failed to leave", (err as Error).message);
    } finally {
      setActionLoading(false);
      setLeaveModal(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      await deleteHousehold();
      addToast("info", "Household deleted");
      navigate("/", { replace: true });
    } catch (err) {
      addToast("error", "Failed to delete", (err as Error).message);
    } finally {
      setActionLoading(false);
      setDeleteModal(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <h1 className="font-display font-extrabold text-3xl text-charcoal tracking-tight">
        Household Settings
      </h1>

      {/* Household name */}
      <section className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-5">Household</h2>

        <div className="flex items-center gap-4 mb-6">
          <HouseholdAvatar id={activeHousehold.id} name={activeHousehold.name} size="lg" />
          <div>
            <p className="font-semibold text-charcoal text-lg">{activeHousehold.name}</p>
            <p className="text-sm text-charcoal-muted">
              {activeHousehold.memberCount} {activeHousehold.memberCount === 1 ? "member" : "members"}
            </p>
          </div>
        </div>

        {isOwner && (
          <>
            {!editingName ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNameValue(activeHousehold.name);
                  setEditingName(true);
                }}
              >
                Rename Household
              </Button>
            ) : (
              <form onSubmit={handleNameSave} className="flex items-start gap-3 max-w-sm">
                <Input
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  error={nameError}
                  autoFocus
                />
                <div className="flex gap-2 mt-0.5 shrink-0">
                  <Button type="submit" size="sm" loading={savingName}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingName(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </section>

      {/* Invite code */}
      <section className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-5">Invite Code</h2>
        <p className="text-sm text-charcoal-muted mb-4">
          Share this code to invite others to your household.
        </p>
        <InviteCodeDisplay />
      </section>

      {/* Members */}
      <section className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-2">
          Members ({members.length})
        </h2>
        <MemberList />
      </section>

      {/* Danger zone */}
      <section className="bg-white rounded-lg border border-error/20 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-error mb-4">Danger Zone</h2>

        {!isOwner && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-charcoal text-sm">Leave Household</p>
              <p className="text-charcoal-muted text-sm">
                You'll lose access to this household immediately.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveModal(true)}
              className="border-error/40 text-error hover:border-error hover:text-error shrink-0"
            >
              Leave
            </Button>
          </div>
        )}

        {isOwner && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-charcoal text-sm">Delete Household</p>
              <p className="text-charcoal-muted text-sm">
                Permanently deletes the household and removes all members.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModal(true)}
              className="border-error/40 text-error hover:border-error hover:text-error shrink-0"
            >
              Delete
            </Button>
          </div>
        )}
      </section>

      {/* Modals */}
      <ConfirmModal
        open={leaveModal}
        onClose={() => setLeaveModal(false)}
        onConfirm={handleLeave}
        title="Leave Household"
        description={`Are you sure you want to leave "${activeHousehold.name}"? You'll need a new invite code to rejoin.`}
        confirmLabel="Leave"
        loading={actionLoading}
        variant="danger"
      />

      <ConfirmModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Household"
        description={`This will permanently delete "${activeHousehold.name}" and remove all ${members.length} members. This cannot be undone.`}
        confirmLabel="Delete Permanently"
        loading={actionLoading}
        variant="danger"
      />
    </div>
  );
}
