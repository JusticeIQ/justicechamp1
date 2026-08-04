"use client";

import React from "react";
import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("bg-white rounded-xl2 shadow-card border border-black/5 p-5 md:p-6", className)}>{children}</div>;
}

export function Badge({ children, tone = "teal" }: { children: React.ReactNode; tone?: "teal" | "navy" | "amber" | "gray" | "red" }) {
  const tones: Record<string, string> = {
    teal: "bg-teal-100 text-teal-700",
    navy: "bg-navy-800 text-white",
    amber: "bg-amber-100 text-amber-800",
    gray: "bg-gray-100 text-gray-700",
    red: "bg-red-100 text-red-700",
  };
  return <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", tones[tone])}>{children}</span>;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "outline" | "cta"; size?: "sm" | "md" | "lg" }) {
  const variants: Record<string, string> = {
    primary: "bg-navy-900 text-white hover:bg-navy-800",
    secondary: "bg-teal-500 text-white hover:bg-teal-600",
    outline: "bg-white text-navy-900 border border-navy-900/20 hover:bg-navy-900/5",
    ghost: "bg-transparent text-navy-900 hover:bg-navy-900/5",
    cta: "bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/30",
  };
  const sizes: Record<string, string> = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };
  return (
    <button
      className={clsx("rounded-lg font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "cta";
  size?: "sm" | "md" | "lg";
}) {
  const variants: Record<string, string> = {
    primary: "bg-navy-900 text-white hover:bg-navy-800",
    secondary: "bg-teal-500 text-white hover:bg-teal-600",
    outline: "bg-white text-navy-900 border border-navy-900/20 hover:bg-navy-900/5",
    ghost: "bg-transparent text-navy-900 hover:bg-navy-900/5",
    cta: "bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/30",
  };
  const sizes: Record<string, string> = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };
  return (
    <a href={href} className={clsx("inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-ring", variants[variant], sizes[size], className)}>
      {children}
    </a>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-navy-700 mb-1">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-navy-900/10 rounded-full overflow-hidden">
        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={clsx("rounded-lg border border-amber-300 bg-amber-50 text-amber-900 flex gap-2", compact ? "p-3 text-xs" : "p-4 text-sm")}>
      <span aria-hidden>ⓘ</span>
      <p>
        JusticeChamp is not a law firm and does not provide legal advice. Information and scores shown are preliminary and
        informational only, and do not replace advice from a licensed lawyer.
      </p>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-navy-900/15 rounded-xl2 bg-white/60">
      <h3 className="font-semibold text-navy-900">{title}</h3>
      <p className="text-sm text-navy-700 mt-1 max-w-md mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-navy-700 py-8 justify-center" role="status" aria-live="polite">
      <span className="h-4 w-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      {label}...
    </div>
  );
}
