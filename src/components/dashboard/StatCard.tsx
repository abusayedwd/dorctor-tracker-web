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
}

function StatCardBase({ label, value, icon, hint, change, decimals = 0 }: StatCardProps) {
  const direction = change === undefined ? null : change > 0 ? "up" : change < 0 ? "down" : "flat";
  const TrendIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-secondary">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      </div>
      <p className="tabular mt-3 text-3xl font-semibold tracking-tight text-ink">
        {decimals ? value.toFixed(decimals) : formatNumber(value)}
      </p>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        {direction && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
              direction === "up" && "bg-emerald-50 text-emerald-700",
              direction === "down" && "bg-red-50 text-red-700",
              direction === "flat" && "bg-slate-100 text-ink-secondary",
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden />
            <span className="tabular">{Math.abs(change!)}%</span>
            <span className="sr-only">{direction === "up" ? "increase" : direction === "down" ? "decrease" : "no change"}</span>
          </span>
        )}
        {hint && <span className="text-ink-muted">{hint}</span>}
      </div>
    </Card>
  );
}

export const StatCard = memo(StatCardBase);

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="mt-4 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </Card>
  );
}
