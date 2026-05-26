import { useState } from "react";
import { useHousehold } from "../../hooks/useHousehold";
import { CopyButton } from "../ui/CopyButton";

const DISMISS_KEY = "homesync_solo_banner_dismissed";

export function SinglePersonBanner() {
  const { activeHousehold, isSinglePersonMode } = useHousehold();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "true"
  );

  if (!isSinglePersonMode || dismissed || !activeHousehold) return null;

  const shareUrl = `${window.location.origin}/join?code=${activeHousehold.inviteCode}`;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <div className="relative flex items-start gap-4 bg-warning-light border border-warning/20 rounded-lg p-4 animate-slide-up">
      {/* Icon */}
      <div className="shrink-0 text-warning mt-0.5">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal text-sm">
          You're flying solo — invite roommates or family!
        </p>
        <p className="text-charcoal-light text-xs mt-1">
          Share your invite code so others can join your household.
        </p>
        <div className="mt-3">
          <CopyButton text={shareUrl} label="Copy Invite Link" />
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="shrink-0 text-charcoal-muted hover:text-charcoal transition-colors"
        aria-label="Dismiss"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
