"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
  /** Accessible data-table alternative to the chart. */
  table?: ReactNode;
}

/** Card wrapper that lets every chart be switched to an equivalent data table. */
export function ChartCard({ title, description, className, children, table }: ChartCardProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  const toggle = table ? (
    <div className="flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label={`${title} view`}>
      {(["chart", "table"] as const).map((v) => {
        const Icon = v === "chart" ? BarChart3 : Table2;
        return (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            aria-label={`Show as ${v}`}
            className={cn(
              "flex h-7 w-8 items-center justify-center rounded-md transition-colors",
              view === v ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        );
      })}
    </div>
  ) : undefined;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader title={title} description={description} action={toggle} />
      <div className="flex-1 px-5 pt-4 pb-5">{view === "chart" || !table ? children : table}</div>
    </Card>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-muted text-left text-xs text-ink-muted uppercase">
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={cn("px-3 py-2 font-medium", i > 0 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} className={cn("px-3 py-2", i > 0 ? "tabular text-right" : "text-ink")}>
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
