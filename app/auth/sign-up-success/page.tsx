import { AuthShell, AuthHeading } from "@/components/auth-shell";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import Link from "next/link";

export default function Page() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-8">
        <AuthHeading
          title="Check your inbox"
          description="We’ve sent a confirmation link to your email. Click it to activate your account, then sign in."
        />
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
  title: "Sign Up Success",
  description: "You've successfully signed up. Please check your email to confirm your account before signing in.",
};
