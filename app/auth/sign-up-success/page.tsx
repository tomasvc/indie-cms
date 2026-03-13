import { AuthMarketingPanel } from "@/components/auth-marketing-panel";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh">
      <AuthMarketingPanel />
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 lg:px-12">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div>
            <h2
              className="text-2xl font-semibold text-foreground font-sans tracking-tight"
            >
              Thanks for signing up!
            </h2>
            <p
              className="mt-1 text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
            >
              One last step — confirm your email
            </p>
          </div>
          <p
            className="text-sm text-muted-foreground leading-relaxed"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            We&apos;ve sent a confirmation link to your email address. Please
            check your inbox and click the link to activate your account before
            signing in.
          </p>
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
  title: "Sign Up Success",
  description: "You've successfully signed up. Please check your email to confirm your account before signing in.",
};
