import { AuthShell, AuthHeading } from "@/components/auth-shell";
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
    <p className="text-center text-sm leading-relaxed text-muted-foreground">
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
    <AuthShell>
      <div className="flex flex-col gap-8">
        <AuthHeading
          title="Something went wrong"
          description="We couldn’t complete that action"
        />
        <Suspense
          fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}
        >
          <ErrorContent searchParams={searchParams} />
        </Suspense>
        <Link
          href="/auth/login"
          className="text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export const metadata: Metadata = {
  title: "Error",
  description: "An error occurred",
};
