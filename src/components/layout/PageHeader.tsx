import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {/* Accent bar */}
          <div className="mb-2 flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-500 to-brand-700" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          </div>
          {description && (
            <p className="ml-3 text-sm text-ink-muted leading-relaxed">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
