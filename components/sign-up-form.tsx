"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: email,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div>
        <h2
          className="text-2xl font-semibold text-foreground font-sans tracking-tight"
        >
          Create your account
        </h2>
        <p
          className="mt-1 text-sm text-muted-foreground"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
        >
          Start running your freelance business with clarity
        </p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        <div className="grid gap-1.5">
          <Label
            htmlFor="full-name"
            className="text-sm font-medium"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Full name
          </Label>
          <Input
            id="full-name"
            type="text"
            placeholder="John Doe"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-medium"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-medium"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="repeat-password"
            className="text-sm font-medium"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Confirm password
          </Label>
          <Input
            id="repeat-password"
            type="password"
            required
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="h-11"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" style={{ fontFamily: "var(--font-sans)" }}>
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-sm font-medium"
          disabled={isLoading}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isLoading ? "Creating account…" : "Sign up free"}
        </Button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span
            className="text-xs text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            or
          </span>
          <div className="flex-1 border-t border-border" />
        </div>

        <Link href="/auth/demo" className="block">
          <button
            type="button"
            className="w-full h-11 flex items-center justify-center gap-2 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.92 0.05 163)", color: "oklch(0.45 0.13 163)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 8 16 12 12 16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            Try the demo account
          </button>
        </Link>

        <p
          className="text-center text-sm text-muted-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium hover:underline underline-offset-4 transition-colors"
            style={{ color: "var(--c-green, var(--primary))" }}
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
