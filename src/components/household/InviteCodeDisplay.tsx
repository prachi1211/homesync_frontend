import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../context/ToastContext";
import { CopyButton } from "../ui/CopyButton";
import { Button } from "../ui/Button";

export function InviteCodeDisplay() {
  const { user } = useAuth();
  const { activeHousehold, members, regenerateInviteCode } = useHousehold();
  const { addToast } = useToast();
  const [regenerating, setRegenerating] = useState(false);

  if (!activeHousehold) return null;

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === "owner";

  const shareUrl = `${window.location.origin}/join?code=${activeHousehold.inviteCode}`;

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await regenerateInviteCode();
      addToast("success", "Invite code regenerated");
    } catch (err) {
      addToast("error", "Failed to regenerate", (err as Error).message);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Code display */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-cream-dark border border-charcoal-muted/15 rounded-lg px-6 py-3 font-mono text-2xl font-bold text-charcoal tracking-[0.3em]">
          {activeHousehold.inviteCode}
        </div>
        <CopyButton text={activeHousehold.inviteCode} label="Copy Code" />
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            loading={regenerating}
            className="text-charcoal-light"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Regenerate
          </Button>
        )}
      </div>

      {/* Shareable link */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-charcoal-light uppercase tracking-wider">
          Shareable Link
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="text-xs text-charcoal-muted bg-cream-dark border border-line rounded px-3 py-2 break-all">
            {shareUrl}
          </code>
          <CopyButton text={shareUrl} label="Copy Link" />
        </div>
      </div>
    </div>
  );
}
