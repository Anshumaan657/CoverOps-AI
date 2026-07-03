import Link from "next/link";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/intake", label: "Customer Intake" },
  { href: "/review", label: "Human Review" },
  { href: "/audit", label: "Audit Log" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7f9] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="bg-opsnavy p-6 text-white lg:min-h-screen">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 font-black text-[#153b64]">CO</div>
          <div>
            <p className="font-black">CoverOps AI</p>
            <p className="text-xs text-slate-300">Insurance ops cockpit</p>
          </div>
        </div>

        <nav className="mt-8 grid gap-2">
          {nav.map((item) => (
            <Link
              className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-[#243449] hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 rounded-lg border border-white/15 bg-white/5 p-4">
          <p className="text-sm font-extrabold">MVP promise</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Intake to underwriter summary</li>
            <li>Document extraction simulation</li>
            <li>Risk triage and missing fields</li>
            <li>Human review and override</li>
            <li>Auditable decision trace</li>
          </ul>
        </div>
      </aside>

      <main className="min-w-0 p-5 md:p-8">{children}</main>
    </div>
  );
}
