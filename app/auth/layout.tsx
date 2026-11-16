import { AuthFrame } from "@/components/auth-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthFrame>{children}</AuthFrame>;
}
