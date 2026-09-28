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
  const messageId = inputId ? `${inputId}-message` : undefined;

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
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            "w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-charcoal",
            "placeholder:text-charcoal-muted/60",
            "transition-[border-color,box-shadow,background-color] duration-150 ease-out",
            "focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/70",
            error
              ? "border-error/70 focus:border-error focus:ring-error/10"
              : "border-line hover:border-charcoal-muted/40",
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
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-9 grid place-items-center rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-cream-dark transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && <p id={messageId} className="text-xs font-medium text-error animate-fade-in">{error}</p>}
      {hint && !error && <p id={messageId} className="text-xs text-charcoal-muted">{hint}</p>}
    </div>
  );
}
