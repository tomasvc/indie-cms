export function AuthMarketingPanel() {
  return (
    <div
      className="hidden lg:flex lg:flex-col lg:w-1/2 relative overflow-hidden p-12 text-white"
      style={{ background: "var(--auth-panel-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(0,0,0,0.45) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "var(--auth-accent-solid)" }}
          >
            OS
          </div>
          <span
            className="text-white font-semibold text-base"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Freelance OS
          </span>
        </div>

        <div className="mb-8">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium border"
            style={{
              color: "var(--auth-accent)",
              borderColor: "var(--auth-badge-border)",
              background: "var(--auth-badge-bg)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Built for independent creatives
          </span>
        </div>

        <div className="mb-6">
          <h1
            className="text-4xl font-semibold leading-tight mb-2 font-sans tracking-tight"
          >
            Run your freelance
            <br />
            business with
            <br />
            <span style={{ color: "var(--auth-accent)" }}>clarity.</span>
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-sans)",
              fontWeight: 300,
            }}
          >
            Projects, clients, invoices and your numbers, in one
            clean workspace designed around how you actually work.
          </p>
        </div>

        <ul className="space-y-4 mb-auto">
          {[
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              ),
              title: "Project tracking",
              desc: "Progress, time burn, and financials in one place.",
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
              title: "Client management",
              desc: "Each client's projects, invoices, and what they owe, in one place.",
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                </svg>
              ),
              title: "Invoice generation",
              desc: "Turn logged time into invoices, then share a link or save a PDF.",
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              ),
              title: "Financial health",
              desc: "Project margins, fees left to invoice, and payments due in the next 30 days.",
            },
          ].map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                style={{
                  background: "var(--auth-icon-bg)",
                  color: "var(--auth-accent)",
                }}
              >
                {item.icon}
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {item.title}
                </p>
                <p
                  className="text-[13px] mt-0.5"
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
