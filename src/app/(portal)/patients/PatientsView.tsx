"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { DateRange, FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { PageHeader } from "@/components/layout/PageHeader";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { PatientTable } from "@/components/patients/PatientTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { CONDITION_META, GENDER_LABEL } from "@/lib/constants";
import { cn, getErrorMessage } from "@/lib/utils";
import { useDeletePatientMutation, useGetPatientsQuery } from "@/store/api/patientApi";
import { GENDERS, PATIENT_CONDITIONS, type Gender, type Patient, type PatientCondition, type PatientListParams } from "@/types";

const SORTS = [
  { value: "admittedAt:desc", label: "Recently admitted" },
  { value: "admittedAt:asc", label: "Earliest admitted" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
  { value: "age:asc", label: "Youngest first" },
  { value: "age:desc", label: "Oldest first" },
];

const DEFAULTS = { page: 1, limit: 10, search: "", condition: "", gender: "", from: "", to: "", sort: "admittedAt:desc" };

export function PatientsView() {
  const { filters, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);
  const [sortBy, order] = filters.sort.split(":") as [PatientListParams["sortBy"], PatientListParams["order"]];

  const { data, isLoading, isFetching, error, refetch } = useGetPatientsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    condition: (filters.condition || undefined) as PatientCondition | undefined,
    gender: (filters.gender || undefined) as Gender | undefined,
    from: filters.from,
    to: filters.to,
    sortBy,
    order,
  });
  const [deletePatient, { isLoading: deleting }] = useDeletePatientMutation();

  const [editing, setEditing] = useState<Patient | null>(null);
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  const closeEdit = useCallback(() => setEditing(null), []);
  const onSearch = useCallback((search: string) => setFilters({ search }), [setFilters]);
  const onPage = useCallback((page: number) => setFilters({ page }), [setFilters]);
  const onLimit = useCallback((limit: number) => setFilters({ limit }), [setFilters]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    const target = toDelete;
    setToDelete(null); // optimistic: the row is already gone from the list
    try {
      await deletePatient(target._id).unwrap();
      toast.success(`${target.name} deleted`);
      if (data && data.items.length === 1 && filters.page > 1) setFilters({ page: filters.page - 1 });
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete patient — it has been restored"));
    }
  };

  return (
    <>
      <PageHeader
        title="Patients"
        description="All patients across doctors. New patients are added from a doctor's page."
        actions={
          <Link
            href="/doctors"
            className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-ink ring-1 ring-line-strong ring-inset hover:bg-surface-muted"
          >
            Go to doctors
          </Link>
        }
      />

      <Card className="overflow-hidden">
        <FilterBar
          activeCount={activeCount}
          onReset={resetFilters}
          search={<SearchInput label="Search patients" placeholder="Search name, phone, email, diagnosis…" value={filters.search} onChange={onSearch} />}
        >
          <Select aria-label="Filter by condition" value={filters.condition} onChange={(e) => setFilters({ condition: e.target.value })} className="lg:w-44">
            <option value="">All conditions</option>
            {PATIENT_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_META[c].label}
              </option>
            ))}
          </Select>
          <Select aria-label="Filter by gender" value={filters.gender} onChange={(e) => setFilters({ gender: e.target.value })} className="lg:w-36">
            <option value="">All genders</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABEL[g]}
              </option>
            ))}
          </Select>
          <DateRange label="Admission date" from={filters.from} to={filters.to} onChange={(r) => setFilters({ from: r.from ?? "", to: r.to ?? "" })} />
          <Select aria-label="Sort patients" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })} className="lg:w-44">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </FilterBar>

        {error && !data ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : !isLoading && data && data.items.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" aria-hidden />}
            title={activeCount ? "No patients match your filters" : "No patients yet"}
            description={activeCount ? "Try a different search or clear the filters." : "Open a doctor's profile to add their first patient."}
            action={
              activeCount ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")} aria-busy={isFetching}>
            <PatientTable patients={data?.items ?? []} loading={isLoading} showDoctor onEdit={setEditing} onDelete={setToDelete} />
          </div>
        )}

        {data && data.meta.total > 0 && <Pagination meta={data.meta} onPageChange={onPage} onLimitChange={onLimit} disabled={isFetching} />}
      </Card>

      <PatientFormModal open={Boolean(editing)} onClose={closeEdit} patient={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete patient?"
        confirmLabel="Delete patient"
        description={
          <>
            <span className="font-medium text-ink">{toDelete?.name}</span> and their record will be permanently deleted. This cannot be undone.
          </>
        }
      />
    </>
  );
}
