import { UpdatePasswordForm } from "@/components/update-password-form";
import { AuthShell } from "@/components/auth-shell";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default function Page() {
  return (
    <AuthShell>
      <UpdatePasswordForm />
    </AuthShell>
  );
}

export const metadata: Metadata = {
  title: "Update Password",
  description: "Update your password",
};
