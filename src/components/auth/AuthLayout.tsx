import type { ReactNode } from "react";
import { Logo } from "../ui/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-cream">

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden bg-[#0f5238] flex-col justify-between p-12 flex-shrink-0">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="1.4" fill="#ffffff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full bg-white/[0.04]" />
        <div className="absolute top-24 -right-16 w-56 h-56 rounded-full bg-white/[0.04]" />

        {/* Logo */}
        <div className="relative z-10">
          <Logo size="lg" light />
        </div>

        {/* Brand message */}
        <div className="relative z-10 space-y-5">
          <h2 className="font-display text-4xl xl:text-5xl text-white leading-[1.15]">
            Your household,<br />beautifully in sync.
          </h2>
          <p className="text-white/65 text-[1.05rem] leading-relaxed max-w-sm">
            Manage chores, split expenses, and keep everyone on the same page — all in one place.
          </p>
        </div>

        {/* Footer tagline */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-px bg-white/25 rounded" />
          <span className="text-white/35 text-sm">Built for homes that run on teamwork</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden px-6 py-4 border-b border-line bg-white">
          <Logo size="sm" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-16">
          <div className="w-full max-w-md animate-fade-in">
            <div className="space-y-1.5 mb-8">
              <h1 className="font-display text-2xl lg:text-3xl text-charcoal">
                {title}
              </h1>
              {subtitle && (
                <p className="text-charcoal-muted text-sm">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
