import Link from "next/link";
import { AuthMarketingPanel } from "@/components/auth-marketing-panel";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/**
 * Rendered by app/auth/layout.tsx so the shader panel stays mounted (and keeps animating)
 * when navigating between auth pages.
 */
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh gap-3 bg-background p-3 lg:p-4">
      <AuthMarketingPanel />
      <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-12">
        <header className="flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "var(--auth-accent-solid)" }}
            >
              OS
            </span>
            <Typography variant="cardTitle" as="span" className="text-foreground">
              Freelance OS
            </Typography>
          </Link>
        </header>

        {children}
      </div>
    </div>
  );
}

/** Per-page content inside the persistent AuthFrame: the centred form and an optional footer. */
export function AuthShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <main className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      {footer && (
        <footer className="text-center">
          <Typography variant="metadata" as="p">
            {footer}
          </Typography>
        </footer>
      )}
    </>
  );
}

export function AuthHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <Typography variant="pageTitle" as="h2">
        {title}
      </Typography>
      {description && <Typography variant="subtitle">{description}</Typography>}
    </div>
  );
}

export function AuthFooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
