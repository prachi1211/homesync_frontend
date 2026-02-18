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
  const { members, removeMember, transferOwnership } = useHousehold();
  const { addToast } = useToast();

  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === "owner";

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

  async function handleTransfer() {
    if (!transferTarget) return;
    setActionLoading(true);
    try {
      await transferOwnership(transferTarget);
      addToast("success", "Ownership transferred");
    } catch (err) {
      addToast("error", "Transfer failed", (err as Error).message);
    } finally {
      setActionLoading(false);
      setTransferTarget(null);
    }
  }

  const removeTargetName =
    members.find((m) => m.userId === removeTarget)?.userName ?? "";
  const transferTargetName =
    members.find((m) => m.userId === transferTarget)?.userName ?? "";

  return (
    <>
      <ul className="divide-y divide-charcoal-muted/10">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-4 py-4"
          >
            <HouseholdAvatar
              id={member.userId}
              name={member.userName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-charcoal text-sm truncate">
                  {member.userName}
                </span>
                {member.userId === user?.id && (
                  <span className="text-xs text-charcoal-muted">(you)</span>
                )}
                <Badge variant={member.role} />
              </div>
              <p className="text-xs text-charcoal-muted mt-0.5">
                {formatJoinDate(member.joinedAt)}
              </p>
            </div>

            {isOwner && member.userId !== user?.id && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setTransferTarget(member.userId)}
                  className="text-xs text-charcoal-light hover:text-charcoal transition-colors px-2 py-1 rounded hover:bg-charcoal/5"
                >
                  Make owner
                </button>
                <button
                  onClick={() => setRemoveTarget(member.userId)}
                  className="text-xs text-error hover:text-error/80 transition-colors px-2 py-1 rounded hover:bg-error-light"
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
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
        open={transferTarget !== null}
        onClose={() => setTransferTarget(null)}
        onConfirm={handleTransfer}
        title="Transfer Ownership"
        description={`Transfer ownership to ${transferTargetName}? You will become a regular member and lose owner privileges.`}
        confirmLabel="Transfer"
        loading={actionLoading}
        variant="danger"
      />
    </>
  );
}
