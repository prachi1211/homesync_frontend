import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: ReactNode;
}

export function Input({ label, error, hint, icon, type, className, id, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-charcoal">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-charcoal",
            "placeholder:text-charcoal-muted/50",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary",
            error
              ? "border-error ring-1 ring-error/20 bg-error-light/30"
              : "border-[#E8E6E1] hover:border-charcoal-muted/40",
            icon && "pl-11",
            isPassword && "pr-12",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-error animate-fade-in">{error}</p>}
      {hint && !error && <p className="text-xs text-charcoal-muted">{hint}</p>}
    </div>
  );
}
