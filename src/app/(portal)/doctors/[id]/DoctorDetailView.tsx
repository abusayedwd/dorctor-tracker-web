"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { DateRange, FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { DoctorFormModal } from "@/components/doctors/DoctorFormModal";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { PatientTable } from "@/components/patients/PatientTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Avatar, EmptyState, ErrorState, Skeleton } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { CONDITION_META } from "@/lib/constants";
import { cn, formatDate, getErrorMessage, initials } from "@/lib/utils";
import { useGetDoctorPatientsQuery, useGetDoctorQuery, useRemoveDoctorPatientMutation } from "@/store/api/doctorApi";
import { PATIENT_CONDITIONS, type Patient, type PatientCondition } from "@/types";

const DEFAULTS = { page: 1, limit: 10, search: "", condition: "", from: "", to: "" };

export function DoctorDetailView({ id }: { id: string }) {
  const { data: doctor, isLoading: loadingDoctor, error: doctorError, refetch: refetchDoctor } = useGetDoctorQuery(id);
  const { filters, setFilters, resetFilters, activeCount } = useUrlFilters(DEFAULTS);

  const {
    data: patients,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDoctorPatientsQuery(
    {
      doctorId: id,
      params: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        condition: (filters.condition || undefined) as PatientCondition | undefined,
        from: filters.from,
        to: filters.to,
      },
    },
    { skip: !doctor },
  );

  const [removePatient, { isLoading: removing }] = useRemoveDoctorPatientMutation();
  const [editDoctorOpen, setEditDoctorOpen] = useState(false);
  const [patientModal, setPatientModal] = useState<{ open: boolean; patient: Patient | null }>({ open: false, patient: null });
  const [toRemove, setToRemove] = useState<Patient | null>(null);

  const openAdd = () => setPatientModal({ open: true, patient: null });
  const openEdit = useCallback((patient: Patient) => setPatientModal({ open: true, patient }), []);
  const closePatientModal = useCallback(() => setPatientModal((s) => ({ ...s, open: false })), []);
  const onSearch = useCallback((search: string) => setFilters({ search }), [setFilters]);
  const onPage = useCallback((page: number) => setFilters({ page }), [setFilters]);
  const onLimit = useCallback((limit: number) => setFilters({ limit }), [setFilters]);

  const confirmRemove = async () => {
    if (!toRemove) return;
    try {
      await removePatient({ doctorId: id, patientId: toRemove._id }).unwrap();
      toast.success(`${toRemove.name} removed`);
      setToRemove(null);
      if (patients && patients.items.length === 1 && filters.page > 1) setFilters({ page: filters.page - 1 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const backLink = (
    <Link href="/doctors" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
      <ArrowLeft className="h-4 w-4" aria-hidden />
      All doctors
    </Link>
  );

  if (doctorError) {
    const notFound = (doctorError as { status?: number }).status === 404 || (doctorError as { status?: number }).status === 400;
    return (
      <>
        <div className="mb-4">{backLink}</div>
        <Card>
          {notFound ? (
            <EmptyState title="Doctor not found" description="This doctor may have been deleted." action={<Link href="/doctors" className="text-sm font-medium text-brand-600">Back to doctors</Link>} />
          ) : (
            <ErrorState message={getErrorMessage(doctorError)} onRetry={refetchDoctor} />
          )}
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-4">{backLink}</div>

      {/* Profile */}
      <Card className="mb-6 p-5 sm:p-6">
        {loadingDoctor || !doctor ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Avatar label={initials(doctor.name)} className="h-14 w-14 text-base" />
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{doctor.name}</h1>
                <span className="mt-1 inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{doctor.specialization}</span>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-ink-secondary sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Hospital</dt>
                    <Building2 className="h-4 w-4 text-ink-muted" aria-hidden />
                    <dd>{doctor.hospital}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Phone</dt>
                    <Phone className="h-4 w-4 text-ink-muted" aria-hidden />
                    <dd>
                      <a href={`tel:${doctor.phone}`} className="hover:text-ink">{doctor.phone}</a>
                    </dd>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <dt className="sr-only">Email</dt>
                    <Mail className="h-4 w-4 text-ink-muted" aria-hidden />
                    <dd className="truncate">
                      <a href={`mailto:${doctor.email}`} className="hover:text-ink">{doctor.email}</a>
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Joined</dt>
                    <CalendarDays className="h-4 w-4 text-ink-muted" aria-hidden />
                    <dd>Joined {formatDate(doctor.createdAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-col lg:items-end">
              <div className="flex items-center gap-3 rounded-xl bg-surface-muted px-4 py-3 ring-1 ring-line">
                <Users className="h-5 w-5 text-brand-600" aria-hidden />
                <div>
                  <p className="tabular text-xl leading-none font-semibold text-ink">{doctor.patientCount}</p>
                  <p className="mt-1 text-xs text-ink-muted">Total patients</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditDoctorOpen(true)}>
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Edit profile
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Patients */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Patients</h2>
            <p className="text-sm text-ink-muted">Patients currently assigned to this doctor.</p>
          </div>
          <Button size="sm" onClick={openAdd} disabled={!doctor}>
            <Plus className="h-4 w-4" aria-hidden />
            Add patient
          </Button>
        </div>

        <FilterBar
          className="mt-2"
          activeCount={activeCount}
          onReset={resetFilters}
          search={<SearchInput label="Search patients" placeholder="Search name, phone, diagnosis…" value={filters.search} onChange={onSearch} />}
        >
          <Select aria-label="Filter by condition" value={filters.condition} onChange={(e) => setFilters({ condition: e.target.value })} className="lg:w-48">
            <option value="">All conditions</option>
            {PATIENT_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_META[c].label}
              </option>
            ))}
          </Select>
          <DateRange label="Admission date" from={filters.from} to={filters.to} onChange={(r) => setFilters({ from: r.from ?? "", to: r.to ?? "" })} />
        </FilterBar>

        {error && !patients ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : !isLoading && patients && patients.items.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" aria-hidden />}
            title={activeCount ? "No patients match your filters" : "No patients yet"}
            description={activeCount ? "Try a different search or clear the filters." : "Add the first patient for this doctor."}
            action={
              activeCount ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>Clear filters</Button>
              ) : (
                <Button size="sm" onClick={openAdd}>
                  <Plus className="h-4 w-4" aria-hidden /> Add patient
                </Button>
              )
            }
          />
        ) : (
          <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
            <PatientTable
              patients={patients?.items ?? []}
              loading={isLoading || !patients}
              onEdit={openEdit}
              onDelete={setToRemove}
              deleteLabel="Remove"
            />
          </div>
        )}

        {patients && patients.meta.total > 0 && <Pagination meta={patients.meta} onPageChange={onPage} onLimitChange={onLimit} disabled={isFetching} />}
      </Card>

      <DoctorFormModal open={editDoctorOpen} onClose={() => setEditDoctorOpen(false)} doctor={doctor} />
      <PatientFormModal
        open={patientModal.open}
        onClose={closePatientModal}
        doctorId={id}
        doctorName={doctor?.name}
        patient={patientModal.patient}
      />
      <ConfirmDialog
        open={Boolean(toRemove)}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        loading={removing}
        title="Remove patient?"
        confirmLabel="Remove patient"
        description={
          <>
            <span className="font-medium text-ink">{toRemove?.name}</span> will be removed from {doctor?.name}&apos;s patient list and deleted. This cannot be undone.
          </>
        }
      />
    </>
  );
}
