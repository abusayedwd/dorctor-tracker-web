"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FilterValue = string | number | undefined;
type Filters = Record<string, FilterValue>;

const NUMERIC_KEYS = new Set(["page", "limit"]);

/**
 * Keeps list state (search, filters, sort, page) in the URL query string.
 *  - Shareable / bookmarkable views, browser back/forward works.
 *  - The parsed object is memoised on the query string, so RTK Query receives a
 *    stable argument and doesn't refetch on unrelated re-renders.
 *  - Changing any filter other than `page` resets to page 1.
 */
export function useUrlFilters<T extends Filters>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const defaultsKey = JSON.stringify(defaults);

  const filters = useMemo(() => {
    const base = JSON.parse(defaultsKey) as T;
    const parsed: Filters = { ...base };
    new URLSearchParams(query).forEach((value, key) => {
      if (NUMERIC_KEYS.has(key)) {
        const n = Number(value);
        if (Number.isInteger(n) && n > 0) parsed[key] = n;
      } else if (value !== "") {
        parsed[key] = value;
      }
    });
    return parsed as T;
  }, [query, defaultsKey]);

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      const next = new URLSearchParams(query);
      const base = JSON.parse(defaultsKey) as T;
      Object.entries(patch).forEach(([key, value]) => {
        // Default values are omitted to keep URLs short and canonical.
        if (value === undefined || value === "" || value === base[key]) next.delete(key);
        else next.set(key, String(value));
      });
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [query, defaultsKey, pathname, router],
  );

  const resetFilters = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  const activeCount = useMemo(() => {
    const base = JSON.parse(defaultsKey) as T;
    return Object.keys(filters).filter(
      (k) => !["page", "limit", "sortBy", "order"].includes(k) && filters[k] !== base[k],
    ).length;
  }, [filters, defaultsKey]);

  return { filters, setFilters, resetFilters, activeCount };
}
