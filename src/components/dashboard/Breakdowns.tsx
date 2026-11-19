import { memo } from "react";
import { CONDITION_META } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { DashboardStats } from "@/types";

/**
 * Proportion bars in plain HTML: every row carries its text label + value, so
 * identity never depends on colour alone, and it reads well on mobile.
 */
function ConditionBreakdownBase({ data }: { data: DashboardStats["patientsByCondition"] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const rows = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5">
      {/* Composition strip */}
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {rows.map((d) =>
          d.count ? (
            <span key={d.condition} style={{ width: `${(d.count / total) * 100}%`, background: CONDITION_META[d.condition].color }} />
          ) : null,
        )}
      </div>
      <ul className="space-y-3.5">
        {rows.map((d) => {
          const pct = Math.round((d.count / total) * 1000) / 10;
          return (
            <li key={d.condition}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CONDITION_META[d.condition].color }} aria-hidden />
                  {CONDITION_META[d.condition].label}
                </span>
                <span className="tabular text-ink-secondary">
                  <span className="font-medium text-ink">{formatNumber(d.count)}</span>
                  <span className="ml-1.5 text-ink-muted">{pct}%</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const ConditionBreakdown = memo(ConditionBreakdownBase);

function SpecializationListBase({ data }: { data: DashboardStats["specializations"] }) {
  const max = Math.max(1, ...data.map((d) => d.patients));
  return (
    <ul className="space-y-4">
      {data.map((d) => (
        <li key={d.specialization}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink">{d.specialization}</span>
            <span className="tabular shrink-0 text-xs text-ink-muted">
              <span className="text-sm font-medium text-ink">{formatNumber(d.patients)}</span> patients · {d.doctors} doctors
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-chart-1" style={{ width: `${(d.patients / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export const SpecializationList = memo(SpecializationListBase);
