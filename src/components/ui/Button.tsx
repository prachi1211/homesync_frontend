import { type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:scale-[0.98] shadow-sm hover:shadow-md",
  secondary:
    "bg-primary-light text-primary hover:bg-primary-light/80 active:scale-[0.98]",
  outline:
    "border-2 border-charcoal-muted/30 text-charcoal hover:border-primary hover:text-primary active:scale-[0.98]",
  ghost:
    "text-charcoal-light hover:text-charcoal hover:bg-charcoal/5 active:scale-[0.98]",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm rounded-sm",
  md: "px-6 py-3 text-base rounded-md",
  lg: "px-8 py-3.5 text-lg rounded-md",
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
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin-slow h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
