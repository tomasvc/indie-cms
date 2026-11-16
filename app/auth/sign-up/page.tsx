import { SignUpForm } from "@/components/sign-up-form";
import { AuthShell, AuthFooterLink } from "@/components/auth-shell";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default function Page() {
  return (
    <AuthShell
      footer={<>Already have an account? <AuthFooterLink href="/auth/login">Sign in</AuthFooterLink></>}
    >
      <SignUpForm />
    </AuthShell>
  );
}

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign up for a new account",
};
