import { memo, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Feedback";
import { cn, formatNumber } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  hint?: string;
  change?: number;
  decimals?: number;
  color?: "brand" | "teal" | "amber" | "rose";
}

const COLOR = {
  brand: {
    bar:  "from-brand-500 to-brand-700",
    icon: "from-brand-500 to-brand-700",
    bg:   "bg-brand-50/60",
    ring: "ring-brand-100",
    shadow: "shadow-brand",
  },
  teal: {
    bar:  "from-accent-500 to-accent-600",
    icon: "from-accent-500 to-accent-600",
    bg:   "bg-accent-50/80",
    ring: "ring-accent-100",
    shadow: "shadow-teal",
  },
  amber: {
    bar:  "from-amber-400 to-orange-500",
    icon: "from-amber-400 to-orange-500",
    bg:   "bg-amber-50/60",
    ring: "ring-amber-100",
    shadow: "shadow-amber",
  },
  rose: {
    bar:  "from-rose-500 to-red-600",
    icon: "from-rose-500 to-red-600",
    bg:   "bg-rose-50/60",
    ring: "ring-rose-100",
    shadow: "shadow-rose",
  },
} as const;

function StatCardBase({ label, value, icon, hint, change, decimals = 0, color = "brand" }: StatCardProps) {
  const c = COLOR[color];
  const direction = change === undefined ? null : change > 0 ? "up" : change < 0 ? "down" : "flat";
  const TrendIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="relative overflow-hidden p-5 transition-shadow hover:shadow-md group">
      {/* Coloured top bar */}
      <div
        className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90", c.bar)}
        aria-hidden
      />

      {/* Soft tinted background area behind icon */}
      <div
        className={cn(
          "absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-40 blur-2xl",
          c.bg,
        )}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-secondary leading-snug pr-2">{label}</p>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-105",
            c.icon,
          )}
        >
          {icon}
        </span>
      </div>

      <p className="tabular relative mt-4 text-3xl font-bold tracking-tight text-ink">
        {decimals ? value.toFixed(decimals) : formatNumber(value)}
      </p>

      <div className="relative mt-2 flex items-center gap-2 text-xs">
        {direction && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold",
              direction === "up"   && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
              direction === "down" && "bg-red-50 text-red-700 ring-1 ring-red-200",
              direction === "flat" && "bg-slate-100 text-ink-secondary",
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden />
            <span className="tabular">{Math.abs(change!)}%</span>
            <span className="sr-only">
              {direction === "up" ? "increase" : direction === "down" ? "decrease" : "no change"}
            </span>
          </span>
        )}
        {hint && <span className="text-ink-muted truncate">{hint}</span>}
      </div>
    </Card>
  );
}

export const StatCard = memo(StatCardBase);

export function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden p-5">
      {/* top bar */}
      <div className="absolute inset-x-0 top-0 h-1 skeleton-shimmer" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-9 w-24 rounded-lg" />
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-3 w-28 rounded-full" />
      </div>
    </Card>
  );
}
