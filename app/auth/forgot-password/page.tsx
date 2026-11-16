import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthShell, AuthFooterLink } from "@/components/auth-shell";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default function Page() {
  return (
    <AuthShell
      footer={<>Remember your password? <AuthFooterLink href="/auth/login">Sign in</AuthFooterLink></>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Forgot your password? No problem. We'll send you a link to reset your password.",
};
