import { cn } from "../../utils/cn";

interface BadgeProps {
  variant: "owner" | "member";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles = {
  owner: "bg-terracotta-light text-terracotta border border-terracotta/20",
  member: "bg-sage-light text-sage-dark border border-sage/20",
};

const sizeStyles = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

const labels = {
  owner: "Owner",
  member: "Member",
};

export function Badge({ variant, size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {labels[variant]}
    </span>
  );
}
