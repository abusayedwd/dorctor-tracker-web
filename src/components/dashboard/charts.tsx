"use client";

/*
 * Recharts-based charts. Loaded via next/dynamic from the dashboard so the
 * chart library is code-split out of every other route.
 *
 * Data-viz rules applied: single series -> no legend (the card title names
 * it); one blue series colour; thin 2px line; recessive grid; hover tooltip
 * with crosshair; no dual axes.
 */
import { memo } from "react";
import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { formatNumber } from "@/lib/utils";
import type { DashboardStats } from "@/types";

const SERIES = "var(--color-chart-1)";
const GRID = "var(--color-chart-grid)";
const AXIS = "var(--color-chart-axis)";

const toDate = (key: string) => parseISO(key.length === 7 ? `${key}-01` : key);

function ChartTooltip({ active, payload, label, labelFormatter, unit }: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-medium text-ink">{labelFormatter ? labelFormatter(label, payload) : label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-ink-secondary">
        <span className="h-2 w-2 rounded-full" style={{ background: SERIES }} aria-hidden />
        <span className="tabular font-semibold text-ink">{formatNumber(payload[0].value ?? 0)}</span> {unit}
      </p>
    </div>
  );
}

interface TrendChartProps {
  data: DashboardStats["trend"];
  granularity: DashboardStats["range"]["granularity"];
}

function TrendChartBase({ data, granularity }: TrendChartProps) {
  const tickFmt = (key: string) => format(toDate(key), granularity === "month" ? "MMM yy" : "dd MMM");
  const labelFmt = (key: string) => format(toDate(key), granularity === "month" ? "MMMM yyyy" : "EEE, dd MMM yyyy");

  return (
    <div className="h-72" role="img" aria-label="Area chart of new patient admissions over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES} stopOpacity={0.22} />
              <stop offset="100%" stopColor={SERIES} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="0" />
          <XAxis
            dataKey="date"
            tickFormatter={tickFmt}
            tick={{ fill: AXIS, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            minTickGap={24}
          />
          <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            content={<ChartTooltip unit="new patients" />}
            labelFormatter={labelFmt}
            cursor={{ stroke: AXIS, strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="patients"
            name="New patients"
            stroke={SERIES}
            strokeWidth={2}
            fill="url(#trendFill)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-surface)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const TrendChart = memo(TrendChartBase);

function DoctorsBarChartBase({ data }: { data: DashboardStats["patientsPerDoctor"] }) {
  const rows = data.map((d) => ({ ...d, label: d.name.replace(/^Dr\.?\s+/i, "Dr. ") }));
  return (
    <div style={{ height: Math.max(220, rows.length * 38) }} role="img" aria-label="Bar chart of patients per doctor">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tick={{ fill: "var(--color-ink-secondary)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip unit="patients" />} cursor={{ fill: "rgb(15 23 42 / 0.04)" }} />
          <Bar dataKey="patients" fill={SERIES} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
            <LabelList dataKey="patients" position="right" className="tabular" fill="var(--color-ink-secondary)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const DoctorsBarChart = memo(DoctorsBarChartBase);
