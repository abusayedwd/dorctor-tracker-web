"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { format, parseISO } from "date-fns";
import { Activity, AlertTriangle, Stethoscope, Users } from "lucide-react";
import { ConditionBreakdown, SpecializationList } from "@/components/dashboard/Breakdowns";
import { ChartCard, DataTable } from "@/components/dashboard/ChartCard";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/Feedback";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { CONDITION_META, DASHBOARD_RANGES } from "@/lib/constants";
import { cn, getErrorMessage } from "@/lib/utils";
import { useGetDashboardStatsQuery } from "@/store/api/dashboardApi";
import type { DashboardRange } from "@/types";

const ChartSkeleton = ({ height = "h-72" }: { height?: string }) => <Skeleton className={cn("w-full rounded-lg", height)} />;

// Code-split: Recharts is only downloaded when the dashboard renders.
const TrendChart = dynamic(() => import("@/components/dashboard/charts").then((m) => m.TrendChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const DoctorsBarChart = dynamic(() => import("@/components/dashboard/charts").then((m) => m.DoctorsBarChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const TIMEZONE = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
const VALID_RANGES = DASHBOARD_RANGES.map((r) => r.value);

export function DashboardView() {
  const { filters, setFilters } = useUrlFilters({ range: "30" });
  const days = (VALID_RANGES.includes(Number(filters.range) as DashboardRange) ? Number(filters.range) : 30) as DashboardRange;
  const rangeLabel = DASHBOARD_RANGES.find((r) => r.value === days)!.label;

  const { data, isLoading, isFetching, error, refetch } = useGetDashboardStatsQuery({ days, tz: TIMEZONE });

  const trendTable = useMemo(
    () =>
      data?.trend
        .slice()
        .reverse()
        .map((t) => [
          format(parseISO(t.date.length === 7 ? `${t.date}-01` : t.date), data.range.granularity === "month" ? "MMM yyyy" : "dd MMM yyyy"),
          t.patients,
          t.doctors,
        ]) ?? [],
    [data],
  );

  const rangePicker = (
    <div className="flex rounded-lg bg-surface p-1 shadow-card ring-1 ring-line" role="group" aria-label="Date range">
      {DASHBOARD_RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => setFilters({ range: String(r.value) })}
          aria-pressed={days === r.value}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:text-sm",
            days === r.value ? "bg-brand-600 text-white shadow-sm" : "text-ink-secondary hover:bg-slate-100",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );

  if (error && !data) {
    return (
      <>
        <PageHeader title="Dashboard" description="Overview of doctors, patients and admissions." />
        <Card>
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        </Card>
      </>
    );
  }

  const s = data?.summary;

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of doctors, patients and admissions." actions={rangePicker} />

      <div className={cn("space-y-6 transition-opacity", isFetching && !isLoading && "opacity-70")} aria-busy={isFetching}>
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading || !s ? (
            Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total doctors"
                value={s.totalDoctors}
                icon={<Stethoscope className="h-5 w-5" aria-hidden />}
                hint={`+${s.newDoctors} in last ${rangeLabel}`}
              />
              <StatCard label="Total patients" value={s.totalPatients} icon={<Users className="h-5 w-5" aria-hidden />} hint="across all doctors" />
              <StatCard
                label={`New patients · ${rangeLabel}`}
                value={s.newPatients}
                change={s.newPatientsChange}
                icon={<Activity className="h-5 w-5" aria-hidden />}
                hint="vs previous period"
              />
              <StatCard
                label="Critical patients"
                value={s.criticalPatients}
                icon={<AlertTriangle className="h-5 w-5" aria-hidden />}
                hint={`${s.avgPatientsPerDoctor} avg patients / doctor`}
              />
            </>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <ChartCard
            className="xl:col-span-2"
            title="Patient admissions"
            description={`New patients per ${data?.range.granularity ?? "day"} · last ${rangeLabel}`}
            table={<DataTable head={["Date", "Patients", "Doctors joined"]} rows={trendTable} />}
          >
            {isLoading || !data ? <ChartSkeleton /> : <TrendChart data={data.trend} granularity={data.range.granularity} />}
          </ChartCard>

          <ChartCard
            title="Patients by condition"
            description="Current status of all patients"
            table={
              data && (
                <DataTable
                  head={["Condition", "Patients"]}
                  rows={data.patientsByCondition.map((c) => [CONDITION_META[c.condition].label, c.count])}
                />
              )
            }
          >
            {isLoading || !data ? <ChartSkeleton height="h-56" /> : <ConditionBreakdown data={data.patientsByCondition} />}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard
            title="Patients per doctor"
            description="Doctors with the highest patient load"
            table={
              data && (
                <DataTable
                  head={["Doctor", "Specialization", "Patients"]}
                  rows={data.patientsPerDoctor.map((d) => [d.name, d.specialization, d.patients])}
                />
              )
            }
          >
            {isLoading || !data ? (
              <ChartSkeleton />
            ) : data.patientsPerDoctor.length ? (
              <DoctorsBarChart data={data.patientsPerDoctor} />
            ) : (
              <EmptyState title="No doctors yet" />
            )}
          </ChartCard>

          <ChartCard title="Top specializations" description="Patient volume by specialization">
            {isLoading || !data ? (
              <ChartSkeleton />
            ) : data.specializations.length ? (
              <SpecializationList data={data.specializations} />
            ) : (
              <EmptyState title="No specializations yet" />
            )}
          </ChartCard>
        </div>
      </div>
    </>
  );
}
