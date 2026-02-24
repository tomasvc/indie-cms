import { Spotlight } from "@/components/ui/spotlight-new";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh">
      <div className="absolute inset-0 z-0">
        <Spotlight />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
