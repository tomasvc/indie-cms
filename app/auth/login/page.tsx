import { LoginForm } from "@/components/login-form";
import { AuthMarketingPanel } from "@/components/auth-marketing-panel";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default function Page() {
  return (
    <div className="flex min-h-svh">
      <AuthMarketingPanel />
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};
