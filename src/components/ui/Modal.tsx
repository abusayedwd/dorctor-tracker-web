"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

/**
 * Accessible modal: portal, role="dialog", Escape to close, focus moved in on
 * open and restored on close, body scroll locked, focus trapped with Tab.
 */
export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    (focusables().find((el) => el.tagName !== "BUTTON") ?? focusables()[0])?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab") {
        const els = focusables();
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          "relative flex max-h-[92dvh] w-full animate-scale-in flex-col rounded-t-2xl bg-surface shadow-pop sm:rounded-2xl",
          widths[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog" className="-mr-2 -mt-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line bg-surface-muted px-5 py-3 sm:rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
