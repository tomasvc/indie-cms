import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { AuthShell, AuthFooterLink } from "@/components/auth-shell";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ demo_error?: string }>;
}) {
  const { demo_error: demoError } = await searchParams;

  return (
    <LoginForm
      demoError={
        demoError
          ? "The demo couldn't be started. Anonymous sign-in has to be enabled for this project."
          : undefined
      }
    />
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ demo_error?: string }>;
}) {
  return (
    <AuthShell
      footer={<>Don&apos;t have an account? <AuthFooterLink href="/auth/sign-up">Sign up free</AuthFooterLink></>}
    >
      <Suspense fallback={<LoginForm />}>
        <LoginPage searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};
