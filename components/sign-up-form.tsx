"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { errorsFor, toFieldErrors, type FieldErrors } from "@/lib/forms/action-state";
import { signUpSchema } from "@/lib/schemas/auth";
import { AuthHeading } from "@/components/auth-shell";
import { Eye, EyeOff, CirclePlay } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
  const [isPending, setTransition] = useTransition();
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = signUpSchema.safeParse({ fullName, email, password, confirmPassword: repeatPassword });
    setFieldErrors(parsed.success ? {} : toFieldErrors(parsed.error));
    if (!parsed.success) return;

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.fullName,
            username: parsed.data.email,
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
      <AuthHeading
        title="Create your account"
        description="Start running your freelance business with clarity"
      />

      <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="full-name">
            Full name
          </Label>
          <Input
            id="full-name"
            type="text"
            placeholder="Enter your name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!fieldErrors.fullName}
          />
          <FieldError errors={errorsFor(fieldErrors, "fullName")} />
        </div>
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
              placeholder="Create a password"
              autoComplete="new-password"
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
        </div>
        <div className="grid gap-2">
          <Label htmlFor="repeat-password">
            Confirm password
          </Label>
          <Input
            id="repeat-password"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            aria-invalid={!!fieldErrors.confirmPassword}
          />
          <FieldError errors={errorsFor(fieldErrors, "confirmPassword")} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="mt-2 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Sign up free"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading || isPending}
            onClick={() => setTransition(() => router.push("/auth/demo"))}
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
