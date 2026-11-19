"use client";

import { memo, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useLogoutMutation } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";

function TopbarBase({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAppSelector((s) => s.auth.user);
  const [logout, { isLoading }] = useLogoutMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    const id = toast.loading("Signing out…");
    try {
      await logout().unwrap();
      toast.success("Signed out successfully", { id });
    } catch {
      toast.success("Signed out", { id });
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-ink-secondary hover:bg-slate-100 hover:text-ink transition-colors lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-semibold text-ink">{user.name}</p>
                <p className="text-xs text-ink-muted">{user.email}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-brand ring-2 ring-brand-100">
                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
          <span className="h-5 w-px bg-line mx-1" aria-hidden />
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isLoading}
            className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-secondary hover:bg-red-50 hover:text-red-600 disabled:opacity-60 transition-colors"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        loading={isLoading}
        title="Sign out?"
        confirmLabel="Yes, sign out"
        description={
          <span>
            Are you sure you want to sign out
            {user?.name ? (
              <> as <span className="font-medium text-ink">{user.name}</span></>
            ) : null}
            ? You will need to sign in again to access the portal.
          </span>
        }
      />
    </>
  );
}

export const Topbar = memo(TopbarBase);
