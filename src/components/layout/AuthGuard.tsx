"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { refreshSession } from "@/lib/session";
import { sessionEnded, sessionStarted } from "@/store/authSlice";
import { baseApi } from "@/store/api/baseApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/**
 * Client-side half of route protection (the edge middleware is the first half).
 *  1. On first load the access token is not in memory -> restore it from the
 *     httpOnly refresh cookie.
 *  2. Whenever the session ends (logout, refresh failed) -> back to /login.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const status = useAppSelector((s) => s.auth.status);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "idle") return;
    let cancelled = false;
    refreshSession().then((session) => {
      if (cancelled) return;
      dispatch(session ? sessionStarted(session) : sessionEnded());
    });
    return () => {
      cancelled = true;
    };
  }, [status, dispatch]);

  useEffect(() => {
    if (status === "unauthenticated") {
      dispatch(baseApi.util.resetApiState());
      router.replace(pathname === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, dispatch, router, pathname]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden />
        <span className="sr-only">Restoring your session…</span>
      </div>
    );
  }

  return <>{children}</>;
}
