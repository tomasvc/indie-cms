import { AuthMarketingPanel } from "@/components/auth-marketing-panel";
import { Suspense } from "react";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import Link from "next/link";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <p
      className="text-sm text-muted-foreground leading-relaxed"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {params?.error
        ? `Error: ${params.error}`
        : "An unspecified error occurred. Please try again or contact support."}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh">
      <AuthMarketingPanel />
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 lg:px-12">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div>
            <h2
              className="text-2xl font-semibold text-foreground font-sans tracking-tight"
            >
              Something went wrong
            </h2>
            <p
              className="mt-1 text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
            >
              We couldn&apos;t complete that action
            </p>
          </div>
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                Loading…
              </p>
            }
          >
            <ErrorContent searchParams={searchParams} />
          </Suspense>
          <Link
            href="/auth/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            style={{ color: "var(--c-green, var(--primary))", fontFamily: "var(--font-sans)" }}
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Error",
  description: "An error occurred",
};
