import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "danger";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  variant = "default",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Lock page scroll and hand focus back to the trigger on close
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  // Trap focus inside modal
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    el.addEventListener("keydown", handleTab);
    first?.focus();
    return () => el.removeEventListener("keydown", handleTab);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0c1a13]/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      {/* Card — bottom sheet on phones, centered dialog from sm up */}
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-white w-full sm:max-w-md flex flex-col",
          "max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-4rem)]",
          "rounded-t-3xl sm:rounded-2xl shadow-xl",
          "animate-sheet-up sm:animate-pop-in",
          variant === "danger" && "sm:border sm:border-error/15"
        )}
      >
        {/* Grabber (phones only) */}
        <div className="sm:hidden flex justify-center pt-2.5" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-charcoal/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 pt-4 pb-3 sm:pt-5">
          <h2
            id="modal-title"
            className={cn(
              "font-semibold text-[1.0625rem] leading-snug",
              variant === "danger" ? "text-error" : "text-charcoal"
            )}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="-mr-2 h-9 w-9 grid place-items-center rounded-full text-charcoal-muted hover:text-charcoal hover:bg-cream-dark transition-colors"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
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

        {/* Body */}
        <div className="px-6 pb-5 pt-1 overflow-y-auto overscroll-contain">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-line bg-cream/60 sm:rounded-b-2xl flex items-center justify-end gap-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: "default" | "danger";
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  loading = false,
  variant = "default",
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      variant={variant}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-charcoal-light text-sm leading-relaxed">{description}</p>
    </Modal>
  );
}
