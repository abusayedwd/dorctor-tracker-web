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
      <aside className="relative hidden overflow-hidden bg-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <HeartPulse className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold">Doctor Tracker</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl leading-tight font-semibold">Manage doctors, patients and outcomes in one place.</h2>
          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-0.5 text-sm text-white/75">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} Doctor Tracker</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-semibold text-ink">Doctor Tracker</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Sign in to the admin portal to continue.</p>
          <Suspense>
            <LoginForm hasSession={hasSession} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
