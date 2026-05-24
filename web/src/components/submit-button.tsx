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

export function SubmitButton({ idle, pending, variant = "primary", className = "" }: Props) {
  const { pending: isPending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {isPending && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
          aria-hidden
        />
      )}
      {isPending ? pending : idle}
    </button>
  );
}
