import { type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-[0_1px_2px_rgba(12,58,40,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]",
  secondary:
    "bg-primary-light text-primary hover:bg-[#e0f0e6]",
  outline:
    "border border-line text-charcoal bg-white hover:border-charcoal-muted/40 hover:bg-cream shadow-sm",
  ghost:
    "text-charcoal-light hover:text-charcoal hover:bg-charcoal/[0.05]",
  danger:
    "bg-error text-white hover:bg-[#a01717] shadow-sm",
};

const sizeStyles = {
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-12 px-7 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer whitespace-nowrap",
        "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out",
        "active:scale-[0.97]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg className="animate-spin-slow h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
