import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONDITION_META } from "@/lib/constants";
import type { PatientCondition } from "@/types";
import { Button } from "./Button";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200/70", className)} aria-hidden />;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-ink-muted">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden />}
      </div>
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <p className="font-medium text-ink">Couldn&apos;t load data</p>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
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
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-brand-100",
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
