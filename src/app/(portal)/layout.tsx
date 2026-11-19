"use client";

import { useCallback, useState, type ReactNode } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Stable callbacks so the memoised Sidebar/Topbar don't re-render on every page update.
  const openNav = useCallback(() => setMobileNavOpen(true), []);
  const closeNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <AuthGuard>
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-surface focus-visible:px-3 focus-visible:py-2 focus-visible:shadow-pop"
      >
        Skip to content
      </a>
      <div className="min-h-dvh lg:flex">
        <Sidebar mobileOpen={mobileNavOpen} onClose={closeNav} />
        <div className="min-w-0 flex-1">
          <Topbar onMenuClick={openNav} />
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 outline-none sm:px-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
