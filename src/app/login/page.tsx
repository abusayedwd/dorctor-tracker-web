import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Activity, BarChart3, HeartPulse, ShieldCheck } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

const FEATURES = [
  { icon: ShieldCheck, title: "Secure by default", text: "Short-lived tokens with rotating, httpOnly refresh sessions." },
  { icon: Activity, title: "Patient overview", text: "Track conditions and admissions across every doctor." },
  { icon: BarChart3, title: "Live analytics", text: "Trends, workload per doctor and specialization insights." },
];

export default async function LoginPage() {
  // The refresh cookie is httpOnly, so only the server can tell whether a
  // session might exist. Avoids a pointless (401) refresh call for new visitors.
  const hasSession = (await cookies()).has("refresh_token");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* ── Hero side ───────────────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between"
        style={{ background: "linear-gradient(135deg, #1a2370 0%, #2d3db0 50%, #4f63f5 100%)" }}
      >
        {/* dot-grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />
        {/* glow blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-400 opacity-20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent-500 opacity-15 blur-3xl" aria-hidden />

        {/* brand */}
        <div className="relative z-10 flex items-center gap-3 p-10">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 shadow-lg">
            <HeartPulse className="h-6 w-6 text-white" aria-hidden />
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold text-white">Doctor Tracker</span>
            <span className="text-[10px] font-medium tracking-widest text-white/60 uppercase">Admin Portal</span>
          </div>
        </div>

        {/* hero copy */}
        <div className="relative z-10 max-w-md px-10 pb-4">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
            <span className="text-xs font-medium text-white/80">Secure admin access</span>
          </div>
          <h2 className="text-4xl leading-tight font-bold text-white">
            Manage doctors, patients and outcomes in one place.
          </h2>
          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon className="h-5 w-5 text-white" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-white/65">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 p-10 text-sm text-white/40">© {new Date().getFullYear()} Doctor Tracker</p>
      </aside>

      {/* ── Form side ───────────────────────────────────────────── */}
      <main className="flex items-center justify-center bg-page px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm animate-slide-up">
          {/* mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-ink">Doctor Tracker</span>
              <span className="text-[10px] font-medium tracking-widest text-ink-muted uppercase">Admin Portal</span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-8 shadow-md">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
            <p className="mt-1.5 text-sm text-ink-muted">Sign in to continue to the admin portal.</p>
            <Suspense>
              <LoginForm hasSession={hasSession} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
