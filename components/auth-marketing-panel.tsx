import { AuthShader } from "@/components/auth-shader";

export function AuthMarketingPanel() {
  return (
    <div
      className="relative hidden overflow-hidden rounded-[calc(var(--radius)*2.5)] text-white lg:flex lg:w-[48%] lg:flex-col"
      // Shown until the first shader frame lands, and if WebGL is unavailable.
      style={{ background: "var(--auth-panel-bg)" }}
    >
      {/* variant: "contours" | "ribbons" */}
      <AuthShader variant="contours" className="absolute inset-0 h-full w-full" />

      {/* Keeps the headline legible over the brightest ribbons. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 38%, transparent 62%), linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 18%)",
        }}
      />

      <div className="relative flex h-full flex-col p-10 xl:p-12">
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs font-medium uppercase tracking-[0.24em] text-white/85 select-none">
            Built for independent creatives
          </span>
          <span className="h-px w-24 bg-white/50" />
        </div>

        <div className="mt-auto max-w-2xl">
          <h1 className="font-sans text-7xl font-black leading-[1.05] tracking-tighter uppercase select-none">
            Run your freelance
            <br />
            business with
            <br />
            <span style={{ color: "var(--auth-accent)" }}>clarity.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/90 select-none">
            Projects, clients, invoices and your numbers, in one clean
            workspace designed around how you actually work.
          </p>
        </div>
      </div>
    </div>
  );
}
