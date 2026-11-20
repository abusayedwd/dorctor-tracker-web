import { memo } from "react";
import { CONDITION_META } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { DashboardStats } from "@/types";

function ConditionBreakdownBase({ data }: { data: DashboardStats["patientsByCondition"] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const rows = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5">
      {/* Composition strip */}
      <div
        className="flex h-3 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label="Condition distribution"
      >
        {rows.map((d) =>
          d.count ? (
            <span
              key={d.condition}
              style={{ width: `${(d.count / total) * 100}%`, background: CONDITION_META[d.condition].color }}
              className="transition-all duration-500"
            />
          ) : null,
        )}
      </div>

      {/* Legend */}
      <ul className="space-y-3">
        {rows.map((d) => {
          const pct = Math.round((d.count / total) * 1000) / 10;
          const barWidth = `${(d.count / total) * 100}%`;
          return (
            <li key={d.condition}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink">
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ background: CONDITION_META[d.condition].color }}
                    aria-hidden
                  />
                  {CONDITION_META[d.condition].label}
                </span>
                <span className="tabular text-ink-secondary ml-3 shrink-0">
                  <span className="font-semibold text-ink">{formatNumber(d.count)}</span>
                  <span className="ml-1.5 text-xs text-ink-muted">{pct}%</span>
                </span>
              </div>
              {/* Mini progress bar per condition */}
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: barWidth, background: CONDITION_META[d.condition].color }}
                />
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
      {data.map((d, i) => (
        <li key={d.specialization}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              {/* Rank badge */}
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-600 ring-1 ring-brand-100">
                {i + 1}
              </span>
              <span className="truncate font-medium text-ink">{d.specialization}</span>
            </div>
            <span className="tabular shrink-0 text-xs text-ink-muted whitespace-nowrap">
              <span className="text-sm font-semibold text-ink">{formatNumber(d.patients)}</span>
              {" "}patients · {d.doctors} dr.
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
              style={{ width: `${(d.patients / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export const SpecializationList = memo(SpecializationListBase);
