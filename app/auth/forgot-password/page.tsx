import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Forgot your password? No problem. We'll send you a link to reset your password.",
}