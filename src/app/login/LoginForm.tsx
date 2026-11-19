"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { refreshSession } from "@/lib/session";
import { getErrorMessage } from "@/lib/utils";
import { useLoginMutation } from "@/store/api/authApi";
import { sessionStarted } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

/** Only allow same-origin relative paths (prevents open-redirects via ?next=). */
const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";

export function LoginForm({ hasSession }: { hasSession: boolean }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  // Already signed in (valid refresh cookie)? Skip the form.
  useEffect(() => {
    if (!hasSession) return;
    let cancelled = false;
    refreshSession().then((session) => {
      if (session && !cancelled) {
        dispatch(sessionStarted(session));
        router.replace(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [hasSession, dispatch, router, next]);

  const onSubmit = async (values: FormValues) => {
    const id = toast.loading("Signing in…");
    try {
      await login(values).unwrap();
      toast.success("Welcome back!", { id, description: "Redirecting to dashboard…" });
      router.replace(next);
    } catch (err) {
      toast.error("Sign in failed", { id, description: getErrorMessage(err, "Invalid email or password") });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@doctortracker.com"
          icon={<Mail className="h-4 w-4" />}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            className="pr-10"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" className="w-full" loading={isLoading}>
        Sign in
      </Button>

      <p className="rounded-lg bg-surface-muted px-3.5 py-2.5 text-xs text-ink-muted ring-1 ring-line">
        Demo: <span className="font-medium text-ink-secondary">admin@doctortracker.com</span> /{" "}
        <span className="font-medium text-ink-secondary">Admin@12345</span>
      </p>
    </form>
  );
}
