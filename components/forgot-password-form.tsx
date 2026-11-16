"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { errorsFor, toFieldErrors, type FieldErrors } from "@/lib/forms/action-state";
import { forgotPasswordSchema } from "@/lib/schemas/auth";
import { AuthHeading } from "@/components/auth-shell";
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

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    setFieldErrors(parsed.success ? {} : toFieldErrors(parsed.error));
    if (!parsed.success) return;

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
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
        <AuthHeading
          title="Check your email"
          description="If an account exists for that address, a password reset link is on its way."
        />
        <Link
          href="/auth/login"
          className="text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <AuthHeading
        title="Reset your password"
        description="Enter your email and we’ll send you a reset link"
      />

      <form onSubmit={handleForgotPassword} noValidate className="flex flex-col gap-5">
        <div className="grid gap-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-medium"
            
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          <FieldError errors={errorsFor(fieldErrors, "email")} />
        </div>

        {error && (
          <p className="text-sm text-destructive" >
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          
        >
          {isLoading ? "Sending…" : "Send reset email"}
        </Button>
      </form>
    </div>
  );
}
