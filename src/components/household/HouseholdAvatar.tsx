import { cn } from "../../utils/cn";
import { getAvatarColor, getHouseholdInitials } from "../../utils/household.utils";

interface HouseholdAvatarProps {
  id: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-xl",
};

export function HouseholdAvatar({
  id,
  name,
  size = "md",
  className,
}: HouseholdAvatarProps) {
  const colorClass = getAvatarColor(id);
  const initials = getHouseholdInitials(name);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        colorClass,
        sizeStyles[size],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
