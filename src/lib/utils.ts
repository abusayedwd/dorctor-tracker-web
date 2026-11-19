import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { ApiErrorBody } from "@/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (iso: string, pattern = "dd MMM yyyy") => format(parseISO(iso), pattern);

export const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/** Removes empty values so they never reach the query string / cache key. */
export const compact = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as Partial<T>;

/** Extracts a human-readable message from an RTK Query error. */
export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: ApiErrorBody }).data;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(", ");
    if (data?.message) return data.message;
  }
  if (error && typeof error === "object" && "status" in error && error.status === "FETCH_ERROR") {
    return "Cannot reach the server. Check your connection.";
  }
  return fallback;
};

/** Returns server-side field errors keyed by field name (for form integration). */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: ApiErrorBody }).data;
    return Object.fromEntries((data?.errors ?? []).map((e) => [e.field, e.message]));
  }
  return {};
};
