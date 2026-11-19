"use client";

import { memo } from "react";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Feedback";
import { initials } from "@/lib/utils";
import { useLogoutMutation } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";

function TopbarBase({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAppSelector((s) => s.auth.user);
  const [logout, { isLoading }] = useLogoutMutation();

  // The session is ended inside the mutation; AuthGuard performs the redirect.
  const handleLogout = async () => {
    await logout().unwrap().catch(() => undefined);
    toast.success("Signed out");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <Avatar label={initials(user.name)} className="h-8 w-8" />
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium text-ink">{user.name}</p>
              <p className="text-xs text-ink-muted">{user.email}</p>
            </div>
          </div>
        )}
        <span className="h-6 w-px bg-line" aria-hidden />
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-ink-secondary hover:bg-slate-100 hover:text-ink disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}

export const Topbar = memo(TopbarBase);
