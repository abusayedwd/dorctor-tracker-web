"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
  /** Accessible data-table alternative to the chart. */
  table?: ReactNode;
}

export function ChartCard({ title, description, className, children, table }: ChartCardProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  const toggle = table ? (
    <div
      className="flex rounded-lg bg-surface-muted p-0.5 ring-1 ring-line"
      role="group"
      aria-label={`${title} view`}
    >
      {(["chart", "table"] as const).map((v) => {
        const Icon = v === "chart" ? BarChart3 : Table2;
        const active = view === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={active}
            aria-label={`Show as ${v}`}
            className={cn(
              "flex h-7 w-8 items-center justify-center rounded-md transition-all duration-150",
              active
                ? "bg-surface text-brand-600 shadow-xs ring-1 ring-line"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  ) : undefined;

  return (
    <Card className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-1">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-ink-muted leading-snug">{description}</p>
          )}
        </div>
        {toggle}
      </div>

      {/* Divider */}
      <div className="mx-5 mt-3 border-t border-line" />

      {/* Content */}
      <div className="flex-1 px-5 pt-4 pb-5">
        {view === "chart" || !table ? children : table}
      </div>
    </Card>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="max-h-72 overflow-auto rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-muted text-left text-xs text-ink-muted uppercase tracking-wide">
          <tr>
            {head.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={cn("px-3 py-2.5 font-medium", i > 0 && "text-right")}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, r) => (
            <tr key={r} className="hover:bg-surface-muted transition-colors">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={cn(
                    "px-3 py-2",
                    i > 0 ? "tabular text-right text-ink-secondary" : "text-ink",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
