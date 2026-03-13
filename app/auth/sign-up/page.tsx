import { SignUpForm } from "@/components/sign-up-form";
import { AuthMarketingPanel } from "@/components/auth-marketing-panel";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default function Page() {
  return (
    <div className="flex min-h-svh">
      <AuthMarketingPanel />
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign up for a new account",
};
