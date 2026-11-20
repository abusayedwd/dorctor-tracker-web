"use client";

import { memo } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, ConditionBadge, Skeleton } from "@/components/ui/Feedback";
import { GENDER_LABEL } from "@/lib/constants";
import { formatDate, initials } from "@/lib/utils";
import type { Patient } from "@/types";

interface PatientTableProps {
  patients: Patient[];
  loading?: boolean;
  showDoctor?: boolean;
  onEdit?: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  deleteLabel?: string;
}

const doctorOf = (p: Patient) => (typeof p.doctor === "string" ? null : p.doctor);

function RowActions({ patient, onEdit, onDelete, deleteLabel }: Pick<PatientTableProps, "onEdit" | "onDelete" | "deleteLabel"> & { patient: Patient }) {
  return (
    <div className="flex justify-end gap-1">
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(patient)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-slate-100 hover:text-ink"
          aria-label={`Edit ${patient.name}`}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete(patient)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-red-50 hover:text-red-600"
        aria-label={`${deleteLabel ?? "Delete"} ${patient.name}`}
        title={deleteLabel ?? "Delete"}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Responsive list: a table on ≥md screens, stacked cards on mobile. */
function PatientTableBase({ patients, loading, showDoctor, onEdit, onDelete, deleteLabel }: PatientTableProps) {
  if (loading) {
    return (
      <div className="divide-y divide-line" aria-busy aria-label="Loading patients">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-36 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
            <Skeleton className="h-5 w-20 rounded-full hidden md:block" />
            <Skeleton className="h-3 w-20 rounded-full hidden lg:block" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-muted text-left text-xs font-medium tracking-wide text-ink-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Patient</th>
              <th scope="col" className="px-4 py-3 font-medium">Age / Gender</th>
              <th scope="col" className="px-4 py-3 font-medium">Condition</th>
              {showDoctor && <th scope="col" className="px-4 py-3 font-medium">Doctor</th>}
              <th scope="col" className="px-4 py-3 font-medium">Diagnosis</th>
              <th scope="col" className="px-4 py-3 font-medium">Admitted</th>
              <th scope="col" className="px-4 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {patients.map((p) => {
              const doctor = doctorOf(p);
              return (
                <tr key={p._id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar label={initials(p.name)} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{p.name}</p>
                        <p className="truncate text-xs text-ink-muted">{p.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="tabular px-4 py-3 text-ink-secondary">
                    {p.age} · {GENDER_LABEL[p.gender]}
                  </td>
                  <td className="px-4 py-3">
                    <ConditionBadge condition={p.condition} />
                  </td>
                  {showDoctor && (
                    <td className="px-4 py-3">
                      {doctor ? (
                        <Link href={`/doctors/${doctor._id}`} className="font-medium text-ink hover:text-brand-600 hover:underline">
                          {doctor.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                      {doctor && <p className="text-xs text-ink-muted">{doctor.specialization}</p>}
                    </td>
                  )}
                  <td className="max-w-56 truncate px-4 py-3 text-ink-secondary" title={p.diagnosis}>
                    {p.diagnosis || "—"}
                  </td>
                  <td className="tabular px-4 py-3 whitespace-nowrap text-ink-secondary">{formatDate(p.admittedAt)}</td>
                  <td className="px-4 py-3">
                    <RowActions patient={p} onEdit={onEdit} onDelete={onDelete} deleteLabel={deleteLabel} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {patients.map((p) => {
          const doctor = doctorOf(p);
          return (
            <li key={p._id} className="flex gap-3 px-4 py-4">
              <Avatar label={initials(p.name)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-muted">
                      {p.age} yrs · {GENDER_LABEL[p.gender]} · {formatDate(p.admittedAt)}
                    </p>
                  </div>
                  <RowActions patient={p} onEdit={onEdit} onDelete={onDelete} deleteLabel={deleteLabel} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ConditionBadge condition={p.condition} />
                  {p.diagnosis && <span className="truncate text-xs text-ink-secondary">{p.diagnosis}</span>}
                </div>
                {showDoctor && doctor && (
                  <Link href={`/doctors/${doctor._id}`} className="mt-1.5 inline-block text-xs font-medium text-brand-600">
                    {doctor.name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export const PatientTable = memo(PatientTableBase);
