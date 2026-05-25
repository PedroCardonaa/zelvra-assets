"use client";

import { useFormStatus } from "react-dom";

type Props = {
  idle: string;
  pending: string;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
};

const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-[color:var(--accent)] text-black hover:bg-[color:var(--accent-dim)] hover:text-white shadow-[0_0_18px_var(--accent-glow)]",
  ghost:
    "border border-[color:var(--border-strong)] text-[color:var(--foreground)] hover:bg-[color:var(--background-elev)]",
  danger:
    "text-[color:var(--danger)] hover:underline",
};

function Spinner() {
  // Phosphor sweep: a 270° arc that spins. Renders at the current text color.
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="spinner"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 1-9 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SubmitButton({ idle, pending, variant = "primary", className = "" }: Props) {
  const { pending: isPending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {isPending && <Spinner />}
      {isPending ? pending : idle}
    </button>
  );
}
