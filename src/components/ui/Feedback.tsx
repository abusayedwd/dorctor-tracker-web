import type { CSSProperties, ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONDITION_META } from "@/lib/constants";
import type { PatientCondition } from "@/types";
import { Button } from "./Button";

/* ─── Base shimmer block ─────────────────────────────────────── */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("skeleton-shimmer rounded-lg", className)} style={style} aria-hidden />
  );
}

/* ─── Stacked text lines ─────────────────────────────────────── */
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

/* ─── Card skeleton (generic content placeholder) ───────────── */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-5 shadow-card", className)} aria-busy aria-hidden>
      <div className="flex items-center justify-between gap-4 mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-2 h-3 w-4/6" />
    </div>
  );
}

/* ─── Chart-shaped skeleton ──────────────────────────────────── */
export function ChartSkeleton({ height = "h-72", bars = 7 }: { height?: string; bars?: number }) {
  return (
    <div className={cn("flex w-full flex-col gap-3", height)} aria-hidden aria-busy>
      {/* Y-axis lines */}
      <div className="flex flex-1 flex-col justify-between pb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-7 rounded-sm" />
            <div className="flex-1 border-t border-dashed border-line" />
          </div>
        ))}
      </div>
      {/* Bars */}
      <div className="flex items-end justify-between gap-2 px-9">
        {Array.from({ length: bars }, (_, i) => {
          const heights = ["h-16", "h-24", "h-20", "h-32", "h-28", "h-14", "h-36"];
          return (
            <Skeleton
              key={i}
              className={cn("flex-1 rounded-t-md", heights[i % heights.length])}
              style={{ animationDelay: `${i * 80}ms` } as CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────── */
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-ink-muted ring-1 ring-line shadow-xs">
        {icon ?? <Inbox className="h-7 w-7" aria-hidden />}
      </div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-ink-muted leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ─── Error state ────────────────────────────────────────────── */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <p className="text-base font-semibold text-ink">Couldn&apos;t load data</p>
      <p className="mt-2 max-w-sm text-sm text-ink-muted leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5 gap-2" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}

/* ─── Condition badge ────────────────────────────────────────── */
export function ConditionBadge({ condition }: { condition: PatientCondition }) {
  const meta = CONDITION_META[condition];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        meta.badge,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}

/* ─── Avatar ─────────────────────────────────────────────────── */
export function Avatar({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-200 shadow-xs",
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
