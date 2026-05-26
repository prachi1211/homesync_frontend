import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../ui/Badge";
import { ConfirmModal } from "../ui/Modal";
import { HouseholdAvatar } from "./HouseholdAvatar";
import { formatJoinDate } from "../../utils/household.utils";

export function MemberList() {
  const { user } = useAuth();
  const { members, removeMember, changeRole } = useHousehold();
  const { addToast } = useToast();

  const [removeTarget,  setRemoveTarget]  = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<string | null>(null);
  const [demoteTarget,  setDemoteTarget]  = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === "owner";
  const ownerCount = members.filter((m) => m.role === "owner").length;

  async function handleRemove() {
    if (!removeTarget) return;
    setActionLoading(true);
    try {
      await removeMember(removeTarget);
      addToast("success", "Member removed");
    } catch (err) {
      addToast("error", "Failed to remove member", (err as Error).message);
    } finally {
      setActionLoading(false);
      setRemoveTarget(null);
    }
  }

  async function handlePromote() {
    if (!promoteTarget) return;
    setActionLoading(true);
    try {
      await changeRole(promoteTarget, "owner");
      addToast("success", "Member promoted to owner");
    } catch (err) {
      addToast("error", "Promotion failed", (err as Error).message);
    } finally {
      setActionLoading(false);
      setPromoteTarget(null);
    }
  }

  async function handleDemote() {
    if (!demoteTarget) return;
    setActionLoading(true);
    try {
      await changeRole(demoteTarget, "member");
      addToast("success", "Owner demoted to member");
    } catch (err) {
      addToast("error", "Demotion failed", (err as Error).message);
    } finally {
      setActionLoading(false);
      setDemoteTarget(null);
    }
  }

  const removeTargetName  = members.find((m) => m.userId === removeTarget)?.userName  ?? "";
  const promoteTargetName = members.find((m) => m.userId === promoteTarget)?.userName ?? "";
  const demoteTargetName  = members.find((m) => m.userId === demoteTarget)?.userName  ?? "";

  return (
    <>
      <ul className="divide-y divide-charcoal-muted/10">
        {members.map((member) => {
          const isSelf    = member.userId === user?.id;
          const isTarget  = member.role === "owner";

          return (
            <li key={member.id} className="flex items-center gap-4 py-4">
              <HouseholdAvatar id={member.userId} name={member.userName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-charcoal text-sm truncate">
                    {member.userName}
                  </span>
                  {isSelf && (
                    <span className="text-xs text-charcoal-muted">(you)</span>
                  )}
                  <Badge variant={member.role} />
                </div>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  {formatJoinDate(member.joinedAt)}
                </p>
              </div>

              {isOwner && !isSelf && (
                <div className="flex items-center gap-2 shrink-0">
                  {isTarget ? (
                    /* Other owner: can demote if not the last owner */
                    ownerCount > 1 && (
                      <button
                        onClick={() => setDemoteTarget(member.userId)}
                        className="text-xs text-charcoal-light hover:text-charcoal transition-colors px-2 py-1 rounded hover:bg-charcoal/5"
                      >
                        Demote
                      </button>
                    )
                  ) : (
                    /* Regular member: can promote to owner */
                    <button
                      onClick={() => setPromoteTarget(member.userId)}
                      className="text-xs text-charcoal-light hover:text-charcoal transition-colors px-2 py-1 rounded hover:bg-charcoal/5"
                    >
                      Make owner
                    </button>
                  )}
                  <button
                    onClick={() => setRemoveTarget(member.userId)}
                    className="text-xs text-error hover:text-error/80 transition-colors px-2 py-1 rounded hover:bg-error-light"
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmModal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove Member"
        description={`Remove ${removeTargetName} from this household? They will lose access immediately.`}
        confirmLabel="Remove"
        loading={actionLoading}
        variant="danger"
      />

      <ConfirmModal
        open={promoteTarget !== null}
        onClose={() => setPromoteTarget(null)}
        onConfirm={handlePromote}
        title="Promote to Owner"
        description={`Promote ${promoteTargetName} to owner? They will have full household management rights alongside existing owners.`}
        confirmLabel="Promote"
        loading={actionLoading}
      />

      <ConfirmModal
        open={demoteTarget !== null}
        onClose={() => setDemoteTarget(null)}
        onConfirm={handleDemote}
        title="Demote to Member"
        description={`Demote ${demoteTargetName} to a regular member? They will lose owner privileges.`}
        confirmLabel="Demote"
        loading={actionLoading}
        variant="danger"
      />
    </>
  );
}
