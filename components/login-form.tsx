"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { errorsFor, toFieldErrors, type FieldErrors } from "@/lib/forms/action-state";
import { loginSchema } from "@/lib/schemas/auth";
import { AuthHeading } from "@/components/auth-shell";
import { Eye, EyeOff, CirclePlay } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm({
  className,
  demoError,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { demoError?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(demoError ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    setFieldErrors(parsed.success ? {} : toFieldErrors(parsed.error));
    if (!parsed.success) return;

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <AuthHeading
        title="Welcome back"
        description="Enter your email and password to access your account"
      />

      <form onSubmit={handleLogin} noValidate className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          <FieldError errors={errorsFor(fieldErrors, "email")} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError errors={errorsFor(fieldErrors, "password")} />
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="mt-2 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading || isPending}
            onClick={() => startTransition(() => router.push("/auth/demo"))}
          >
            {isPending ? "Starting demo…" : (
              <>
                <CirclePlay className="text-primary" />
                Try the demo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
