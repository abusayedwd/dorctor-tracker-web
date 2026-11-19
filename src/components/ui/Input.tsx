import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted shadow-sm transition " +
  "focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 disabled:bg-surface-muted disabled:text-ink-muted " +
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, icon, ...props }, ref) =>
  icon ? (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">{icon}</span>
      <input ref={ref} className={cn(control, "h-10 pl-9", className)} {...props} />
    </div>
  ) : (
    <input ref={ref} className={cn(control, "h-10", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select ref={ref} className={cn(control, "h-10 appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
    </div>
  ),
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(control, "min-h-20 py-2", className)} {...props} />,
);
Textarea.displayName = "Textarea";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + error message, wired together for screen readers. */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-red-600" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}
