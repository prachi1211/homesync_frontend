import { cn } from "../../utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  light?: boolean;
}

const sizes = {
  sm: { icon: 26, text: "text-lg" },
  md: { icon: 32, text: "text-2xl" },
  lg: { icon: 42, text: "text-3xl" },
};

export function Logo({ size = "md", className, light = false }: LogoProps) {
  const s = sizes[size];
  const houseColor   = light ? "#ffffff"       : "#0f5238";
  const chimneyColor = light ? "rgba(255,255,255,0.65)" : "#0a3d29";
  const windowColor  = light ? "rgba(15,82,56,0.35)"   : "#edf7f0";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4L4 18H9V34H17V24H23V34H31V18H36L20 4Z" fill={houseColor} />
        <rect x="26" y="8" width="4" height="8" rx="1" fill={chimneyColor} />
        <rect x="17" y="17" width="6" height="5" rx="1" fill={windowColor} />
      </svg>
      <span className={cn("font-sans font-extrabold tracking-tight", s.text, light ? "text-white" : "text-charcoal")}>
        HomeSync
      </span>
    </div>
  );
}
