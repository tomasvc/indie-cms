import { SignUpForm } from "@/components/sign-up-form";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign up for a new account",
}
