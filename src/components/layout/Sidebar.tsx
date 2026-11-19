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
    <Link href="/dashboard" className="flex items-center gap-3 px-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
        <HeartPulse className="h-5 w-5" aria-hidden />
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-ink">Doctor Tracker</span>
        <span className="text-[10px] font-medium tracking-widest text-ink-muted uppercase">Admin Portal</span>
      </div>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="mt-8 space-y-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-brand-50 text-brand-700 shadow-xs"
                : "text-ink-secondary hover:bg-slate-50 hover:text-ink",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" aria-hidden />
            )}
            <span className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              active ? "bg-brand-100 text-brand-600" : "text-ink-muted group-hover:text-ink-secondary",
            )}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-line pt-4">
      <p className="px-3 text-[10px] font-medium tracking-wider text-ink-muted uppercase">v1.0.0</p>
    </div>
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
      <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
        <div className="sticky top-0 flex h-dvh flex-col overflow-y-auto px-4 py-5">
          <Brand />
          <NavLinks />
          <SidebarFooter />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <aside className="relative flex h-full w-72 max-w-[85%] animate-scale-in flex-col bg-surface px-4 py-5 shadow-pop">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-slate-100 hover:text-ink transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={onClose} />
            <SidebarFooter />
          </aside>
        </div>
      )}
    </>
  );
}

export const Sidebar = memo(SidebarBase);
