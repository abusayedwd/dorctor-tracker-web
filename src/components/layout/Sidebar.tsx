"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, LayoutDashboard, Stethoscope, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
] as const;

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <HeartPulse className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink">Doctor Tracker</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="mt-8 space-y-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-brand-50 text-brand-700" : "text-ink-secondary hover:bg-slate-100 hover:text-ink",
            )}
          >
            <Icon className={cn("h-4.5 w-4.5", active ? "text-brand-600" : "text-ink-muted group-hover:text-ink-secondary")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarBase({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      {/* In-flow column (stretches with the page) + sticky inner nav. */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
        <div className="sticky top-0 h-dvh overflow-y-auto px-4 py-5">
          <Brand />
          <NavLinks />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={onClose} aria-hidden />
          <aside className="relative h-full w-72 max-w-[85%] animate-scale-in bg-surface px-4 py-5 shadow-pop">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}

export const Sidebar = memo(SidebarBase);
