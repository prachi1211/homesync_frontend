import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHousehold } from "../../hooks/useHousehold";
import { HouseholdAvatar } from "./HouseholdAvatar";

export function HouseholdSelector() {
  const { households, activeHousehold, setActiveHousehold } = useHousehold();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleSwitch(id: string) {
    if (id === activeHousehold?.id) {
      setOpen(false);
      return;
    }
    setSwitching(id);
    try {
      await setActiveHousehold(id);
    } finally {
      setSwitching(null);
      setOpen(false);
    }
  }

  if (!activeHousehold) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-charcoal/5 transition-colors max-w-[220px]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <HouseholdAvatar id={activeHousehold.id} name={activeHousehold.name} size="sm" />
        <span className="text-sm font-medium text-charcoal truncate">
          {activeHousehold.name}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`text-charcoal-muted shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-lg border border-charcoal-muted/10 py-1 z-40 animate-slide-up">
          <p className="px-3 py-1.5 text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
            Your Households
          </p>

          <ul role="listbox">
            {households.map((h) => (
              <li key={h.id} role="option" aria-selected={h.id === activeHousehold.id}>
                <button
                  onClick={() => handleSwitch(h.id)}
                  disabled={switching === h.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-cream transition-colors"
                >
                  <HouseholdAvatar id={h.id} name={h.name} size="sm" />
                  <span className="flex-1 text-left text-sm font-medium text-charcoal truncate">
                    {h.name}
                  </span>
                  {h.id === activeHousehold.id && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="text-primary shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {switching === h.id && (
                    <svg className="animate-spin-slow h-4 w-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-charcoal-muted/10 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); navigate("/onboarding?mode=create"); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal-light hover:bg-cream hover:text-charcoal transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create new household
            </button>
            <button
              onClick={() => { setOpen(false); navigate("/join"); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal-light hover:bg-cream hover:text-charcoal transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" x2="3" y1="12" y2="12" />
              </svg>
              Join a household
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
