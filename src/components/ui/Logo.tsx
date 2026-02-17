import { cn } from "../../utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  light?: boolean;
}

const sizes = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-2xl" },
  lg: { icon: 40, text: "text-3xl" },
};

export function Logo({ size = "md", className, light = false }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* House shape */}
        <path
          d="M20 4L4 18H9V34H17V24H23V34H31V18H36L20 4Z"
          fill={light ? "#f9fafb" : "#4f46e5"}
        />
        {/* Chimney */}
        <rect
          x="26"
          y="8"
          width="4"
          height="8"
          rx="1"
          fill={light ? "rgba(249,250,251,0.7)" : "#4338ca"}
        />
        {/* Window */}
        <rect
          x="17"
          y="17"
          width="6"
          height="5"
          rx="1"
          fill={light ? "rgba(79,70,229,0.3)" : "#f9fafb"}
        />
      </svg>
      <span
        className={cn(
          "font-display font-extrabold tracking-tight",
          s.text,
          light ? "text-cream" : "text-charcoal"
        )}
      >
        HomeSync
      </span>
    </div>
  );
}
