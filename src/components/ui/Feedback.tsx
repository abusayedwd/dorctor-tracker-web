import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONDITION_META } from "@/lib/constants";
import type { PatientCondition } from "@/types";
import { Button } from "./Button";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-lg", className)}
      aria-hidden
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            "skeleton-shimmer h-3 rounded-full",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-ink-muted ring-1 ring-line shadow-xs">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden />}
      </div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <p className="text-base font-semibold text-ink">Couldn&apos;t load data</p>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Condition badge: status colour + dot + text label (never colour alone). */
export function ConditionBadge({ condition }: { condition: PatientCondition }) {
  const meta = CONDITION_META[condition];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        meta.badge,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} aria-hidden />
      {meta.label}
    </span>
  );
}

export function Avatar({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-200",
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
