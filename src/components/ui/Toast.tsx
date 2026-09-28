import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { Toast as ToastType } from "../../types/auth.types";
import { cn } from "../../utils/cn";

const typeStyles = {
  success: { icon: CheckCircle2, tint: "text-sage" },
  error: { icon: XCircle, tint: "text-error" },
  info: { icon: Info, tint: "text-primary" },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastType;
  onDismiss: (id: string) => void;
}) {
  const { icon: Icon, tint } = typeStyles[toast.type];

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex items-start gap-3 w-full sm:w-[380px] pl-4 pr-2 py-3",
        "bg-white rounded-2xl border border-line shadow-lg animate-slide-in-right"
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", tint)} strokeWidth={2.2} aria-hidden="true" />
      <div className="flex-1 min-w-0 pt-px">
        <p className="font-semibold text-sm text-charcoal leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-charcoal-muted mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 h-7 w-7 grid place-items-center rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-cream-dark transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed z-[70] flex flex-col gap-2 pointer-events-none",
        // Phones: full-width, floating above the bottom nav. Desktop: bottom-right.
        "inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
        "lg:inset-x-auto lg:right-6 lg:bottom-6"
      )}
    >
      {toasts.slice(-3).map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
