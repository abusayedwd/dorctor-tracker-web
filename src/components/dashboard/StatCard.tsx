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

const colorMap = {
  brand: "from-brand-500 to-brand-700",
  teal:  "from-teal-500 to-teal-700",
  amber: "from-amber-400 to-orange-500",
  rose:  "from-rose-500 to-red-600",
};

function StatCardBase({ label, value, icon, hint, change, decimals = 0, color = "brand" }: StatCardProps) {
  const direction = change === undefined ? null : change > 0 ? "up" : change < 0 ? "down" : "flat";
  const TrendIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="relative overflow-hidden p-5 transition-shadow hover:shadow-md">
      {/* subtle top gradient bar */}
      <div className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-70", colorMap[color])} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-secondary leading-snug">{label}</p>
        <span className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
          colorMap[color],
        )}>
          {icon}
        </span>
      </div>

      <p className="tabular mt-4 text-3xl font-bold tracking-tight text-ink">
        {decimals ? value.toFixed(decimals) : formatNumber(value)}
      </p>

      <div className="mt-2 flex items-center gap-2 text-xs">
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
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </Card>
  );
}
