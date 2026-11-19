"use client";

import { memo, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, Pencil, Plus, Stethoscope, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { DateRange, FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { DoctorFormModal } from "@/components/doctors/DoctorFormModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Avatar, EmptyState, ErrorState, Skeleton } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { cn, formatDate, getErrorMessage, initials } from "@/lib/utils";
import { useDeleteDoctorMutation, useGetDoctorFiltersQuery, useGetDoctorsQuery } from "@/store/api/doctorApi";
import type { Doctor, DoctorListParams } from "@/types";

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
  { value: "patientCount:desc", label: "Most patients" },
  { value: "patientCount:asc", label: "Fewest patients" },
];

const DEFAULTS = {
  page: 1,
  limit: 10,
  search: "",
  specialization: "",
  hospital: "",
  from: "",
  to: "",
  sort: "createdAt:desc",
};

interface RowProps {
  doctor: Doctor;
  onEdit: (d: Doctor) => void;
  onDelete: (d: Doctor) => void;
}

const iconBtn = "flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors";

const DoctorRow = memo(function DoctorRow({ doctor: d, onEdit, onDelete }: RowProps) {
  const router = useRouter();
  return (
    <tr className="group cursor-pointer transition-colors hover:bg-surface-muted" onClick={() => router.push(`/doctors/${d._id}`)}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar label={initials(d.name)} />
          <div className="min-w-0">
            <Link
              href={`/doctors/${d._id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate font-medium text-ink group-hover:text-brand-700 hover:underline"
            >
              {d.name}
            </Link>
            <p className="truncate text-xs text-ink-muted">{d.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{d.specialization}</span>
      </td>
      <td className="px-4 py-3 text-ink-secondary">{d.hospital}</td>
      <td className="tabular px-4 py-3 whitespace-nowrap text-ink-secondary">{d.phone}</td>
      <td className="tabular px-4 py-3 text-right font-medium text-ink">{d.patientCount}</td>
      <td className="tabular px-4 py-3 whitespace-nowrap text-ink-secondary">{formatDate(d.createdAt)}</td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-1">
          <button type="button" className={cn(iconBtn, "hover:bg-slate-100 hover:text-ink")} onClick={() => onEdit(d)} aria-label={`Edit ${d.name}`} title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(iconBtn, "hover:bg-red-50 hover:text-red-600")}
            onClick={() => onDelete(d)}
            aria-label={`Delete ${d.name}`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

const DoctorCard = memo(function DoctorCard({ doctor: d, onEdit, onDelete }: RowProps) {
  return (
    <li className="px-4 py-4">
      <div className="flex items-start gap-3">
        <Avatar label={initials(d.name)} />
        <div className="min-w-0 flex-1">
          <Link href={`/doctors/${d._id}`} className="flex items-center gap-1 font-medium text-ink">
            <span className="truncate">{d.name}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
          </Link>
          <p className="truncate text-xs text-ink-muted">{d.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary">
            <span className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-700">{d.specialization}</span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              {d.hospital}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {d.patientCount} patients
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button type="button" className={cn(iconBtn, "hover:bg-slate-100")} onClick={() => onEdit(d)} aria-label={`Edit ${d.name}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" className={cn(iconBtn, "hover:bg-red-50 hover:text-red-600")} onClick={() => onDelete(d)} aria-label={`Delete ${d.name}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
});

export function DoctorsView() {
  const { filters, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);
  const [sortBy, order] = filters.sort.split(":") as [DoctorListParams["sortBy"], DoctorListParams["order"]];

  const { data, isLoading, isFetching, error, refetch } = useGetDoctorsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    specialization: filters.specialization,
    hospital: filters.hospital,
    from: filters.from,
    to: filters.to,
    sortBy,
    order,
  });
  const { data: options } = useGetDoctorFiltersQuery();
  const [deleteDoctor, { isLoading: deleting }] = useDeleteDoctorMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [toDelete, setToDelete] = useState<Doctor | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = useCallback((d: Doctor) => {
    setEditing(d);
    setFormOpen(true);
  }, []);
  const closeForm = useCallback(() => setFormOpen(false), []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await deleteDoctor(toDelete._id).unwrap();
      toast.success(`${toDelete.name} deleted${res.deletedPatients ? ` with ${res.deletedPatients} patients` : ""}`);
      setToDelete(null);
      // Step back if we just removed the last row of the last page.
      if (data && data.items.length === 1 && filters.page > 1) setFilters({ page: filters.page - 1 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onSearch = useCallback((search: string) => setFilters({ search }), [setFilters]);
  const onPage = useCallback((page: number) => setFilters({ page }), [setFilters]);
  const onLimit = useCallback((limit: number) => setFilters({ limit }), [setFilters]);

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Doctors"
        description="Manage doctor profiles and view their patients."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Add doctor
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <FilterBar
          activeCount={activeCount}
          onReset={resetFilters}
          search={<SearchInput label="Search doctors" placeholder="Search name, email, hospital…" value={filters.search} onChange={onSearch} />}
        >
          <Select aria-label="Filter by specialization" value={filters.specialization} onChange={(e) => setFilters({ specialization: e.target.value })} className="lg:w-44">
            <option value="">All specializations</option>
            {options?.specializations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select aria-label="Filter by hospital" value={filters.hospital} onChange={(e) => setFilters({ hospital: e.target.value })} className="lg:w-44">
            <option value="">All hospitals</option>
            {options?.hospitals.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
          <DateRange label="Joined date" from={filters.from} to={filters.to} onChange={(r) => setFilters({ from: r.from ?? "", to: r.to ?? "" })} />
          <Select aria-label="Sort doctors" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })} className="lg:w-40">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </FilterBar>

        {error && !data ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3 p-4" aria-busy>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="h-6 w-6" aria-hidden />}
            title={activeCount ? "No doctors match your filters" : "No doctors yet"}
            description={activeCount ? "Try a different search term or clear the filters." : "Add your first doctor to get started."}
            action={
              activeCount ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" aria-hidden /> Add doctor
                </Button>
              )
            }
          />
        ) : (
          <div className={cn("transition-opacity", isFetching && "opacity-60")} aria-busy={isFetching}>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <caption className="sr-only">Doctors</caption>
                <thead className="border-b border-line bg-surface-muted text-left text-xs tracking-wide text-ink-muted uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Doctor</th>
                    <th scope="col" className="px-4 py-3 font-medium">Specialization</th>
                    <th scope="col" className="px-4 py-3 font-medium">Hospital</th>
                    <th scope="col" className="px-4 py-3 font-medium">Phone</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Patients</th>
                    <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((d) => (
                    <DoctorRow key={d._id} doctor={d} onEdit={openEdit} onDelete={setToDelete} />
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line md:hidden">
              {items.map((d) => (
                <DoctorCard key={d._id} doctor={d} onEdit={openEdit} onDelete={setToDelete} />
              ))}
            </ul>
          </div>
        )}

        {data && data.meta.total > 0 && <Pagination meta={data.meta} onPageChange={onPage} onLimitChange={onLimit} disabled={isFetching} />}
      </Card>

      <DoctorFormModal open={formOpen} onClose={closeForm} doctor={editing} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete doctor?"
        confirmLabel="Delete doctor"
        description={
          <>
            <span className="font-medium text-ink">{toDelete?.name}</span> will be permanently removed
            {toDelete?.patientCount ? (
              <>
                {" "}
                together with their <span className="font-medium text-ink">{toDelete.patientCount} patients</span>
              </>
            ) : null}
            . This cannot be undone.
          </>
        }
      />
    </>
  );
}
