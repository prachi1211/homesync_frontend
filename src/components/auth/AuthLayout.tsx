import type { ReactNode } from "react";
import { Logo } from "../ui/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Brand Panel — left side, hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-[#312e81] p-12 flex-col justify-between">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="30" cy="30" r="1.5" fill="#ffffff" />
                <path
                  d="M0 30h60M30 0v60"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <Logo size="lg" light />
        </div>

        {/* Middle: Brand message */}
        <div className="relative z-10 space-y-6">
          <h2 className="font-display font-extrabold text-4xl xl:text-5xl text-white leading-tight">
            Your household,
            <br />
            beautifully in sync.
          </h2>
          <p className="text-white/70 text-lg max-w-md leading-relaxed">
            Manage chores, split expenses, and keep everyone on the same page
            — all in one place.
          </p>
        </div>

        {/* Bottom: Decorative accent */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-0.5 bg-white/30 rounded" />
          <span className="text-white/40 text-sm">
            Built for homes that run on teamwork
          </span>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-20 -right-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Form Panel — right side */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden px-6 py-5 border-b border-charcoal-muted/10">
          <Logo size="sm" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-16">
          <div className="w-full max-w-md animate-fade-in">
            <div className="space-y-2 mb-8">
              <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-charcoal tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-charcoal-light text-base">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
