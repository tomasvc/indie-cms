"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { errorsFor, toFieldErrors, type FieldErrors } from "@/lib/forms/action-state";
import { updatePasswordSchema } from "@/lib/schemas/auth";
import { AuthHeading } from "@/components/auth-shell";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = updatePasswordSchema.safeParse({ password });
    setFieldErrors(parsed.success ? {} : toFieldErrors(parsed.error));
    if (!parsed.success) return;

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
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
        title="Set a new password"
        description="Choose a strong password for your account"
      />

      <form onSubmit={handleUpdatePassword} noValidate className="flex flex-col gap-5">
        <div className="grid gap-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-medium"
            
          >
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="New password"
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
          {isLoading ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </div>
  );
}
