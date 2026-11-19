import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";
import type { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  disabled?: boolean;
}

/** Page numbers with ellipses: 1 … 4 5 6 … 20 */
const pageWindow = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
};

function PaginationBase({ meta, onPageChange, onLimitChange, disabled }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const btn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col-reverse items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row"
    >
      <div className="flex items-center gap-3 text-sm text-ink-muted">
        <span className="tabular">
          {formatNumber(start)}–{formatNumber(end)} of {formatNumber(total)}
        </span>
        {onLimitChange && (
          <label className="flex items-center gap-1.5">
            <span className="sr-only sm:not-sr-only">Rows</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 rounded-md border border-line-strong bg-surface px-2 text-sm text-ink"
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(btn, "text-ink-secondary hover:bg-slate-100")}
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-ink-muted" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={disabled}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                btn,
                "tabular",
                p === page ? "bg-brand-600 font-medium text-white" : "text-ink-secondary hover:bg-slate-100",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className={cn(btn, "text-ink-secondary hover:bg-slate-100")}
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export const Pagination = memo(PaginationBase);
