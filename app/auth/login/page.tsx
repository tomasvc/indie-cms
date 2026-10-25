import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { AuthMarketingPanel } from "@/components/auth-marketing-panel";
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
    <div className="flex min-h-svh">
      <AuthMarketingPanel />
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<LoginForm />}>
            <LoginPage searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};
