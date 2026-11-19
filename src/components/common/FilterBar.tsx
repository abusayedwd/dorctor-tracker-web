import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  search: ReactNode;
  children?: ReactNode;
  activeCount: number;
  onReset: () => void;
  className?: string;
}

/** One row of filters above a list: search first, then dimension filters, then reset. */
export function FilterBar({ search, children, activeCount, onReset, className }: FilterBarProps) {
  return (
    // Mobile: stacked grid. Desktop: a single wrapping row where every control
    // shares one baseline (children join the parent flex via `contents`).
    <div className={cn("grid grid-cols-1 gap-3 border-b border-line p-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center", className)}>
      <div className="sm:col-span-2 lg:min-w-60 lg:flex-1">{search}</div>
      <div className="contents">
        {children}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-secondary hover:bg-slate-100 hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Clear ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}

interface DateRangeProps {
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
  label: string;
}

export function DateRange({ from, to, onChange, label }: DateRangeProps) {
  const control =
    "h-10 w-full rounded-lg border border-line-strong bg-surface px-2.5 text-sm text-ink shadow-sm focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15 focus:outline-none";
  return (
    <fieldset className="flex items-center gap-2 sm:col-span-2">
      <legend className="sr-only">{label}</legend>
      <input
        type="date"
        aria-label={`${label} from`}
        value={from ?? ""}
        max={to}
        onChange={(e) => onChange({ from: e.target.value || undefined, to })}
        className={cn(control, "lg:w-38")}
      />
      <span className="text-ink-muted" aria-hidden>
        –
      </span>
      <input
        type="date"
        aria-label={`${label} to`}
        value={to ?? ""}
        min={from}
        onChange={(e) => onChange({ from, to: e.target.value || undefined })}
        className={cn(control, "lg:w-38")}
      />
    </fieldset>
  );
}
