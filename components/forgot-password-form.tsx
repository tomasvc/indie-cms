"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={cn("flex flex-col gap-8", className)} {...props}>
        <div>
          <h2
            className="text-2xl font-semibold text-foreground font-sans tracking-tight"
          >
            Check your email
          </h2>
          <p
            className="mt-1 text-sm text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
          >
            Password reset instructions sent
          </p>
        </div>
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          If you registered using your email and password, you will receive a
          password reset email shortly.
        </p>
        <Link
          href="/auth/login"
          className="text-sm font-medium hover:underline underline-offset-4"
          style={{ color: "var(--c-green, var(--primary))", fontFamily: "var(--font-sans)" }}
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div>
        <h2
          className="text-2xl font-semibold text-foreground font-sans tracking-tight"
        >
          Reset your password
        </h2>
        <p
          className="mt-1 text-sm text-muted-foreground"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
        >
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
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
          {isLoading ? "Sending…" : "Send reset email"}
        </Button>

        <p
          className="text-center text-sm text-muted-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-medium hover:underline underline-offset-4"
            style={{ color: "var(--c-green, var(--primary))" }}
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
