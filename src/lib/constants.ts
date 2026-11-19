import type { DashboardRange, Gender, PatientCondition } from "@/types";

export const API_BASE = "/api/v1";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/**
 * Patient condition is a *state*, so it uses the reserved status palette and is
 * always rendered with its text label (never colour alone).
 */
export const CONDITION_META: Record<
  PatientCondition,
  { label: string; color: string; badge: string }
> = {
  stable: { label: "Stable", color: "var(--color-status-good)", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  recovering: { label: "Recovering", color: "var(--color-status-info)", badge: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  under_observation: { label: "Under observation", color: "var(--color-status-warning)", badge: "bg-amber-50 text-amber-800 ring-amber-600/25" },
  critical: { label: "Critical", color: "var(--color-status-critical)", badge: "bg-red-50 text-red-700 ring-red-600/20" },
  discharged: { label: "Discharged", color: "var(--color-status-neutral)", badge: "bg-slate-100 text-slate-700 ring-slate-500/20" },
};

export const GENDER_LABEL: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export const DASHBOARD_RANGES: { value: DashboardRange; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 180, label: "6 months" },
  { value: 365, label: "12 months" },
];
