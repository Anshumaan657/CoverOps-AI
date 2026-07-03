"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RiskBadge, StatusBadge } from "@/components/Badges";
import { StatCard } from "@/components/StatCard";
import { allEvents, getCases, resetCases } from "@/lib/local-store";
import type { InsuranceCase } from "@/lib/types";

export function DashboardClient() {
  const [cases, setCases] = useState<InsuranceCase[]>([]);

  useEffect(() => {
    setCases(getCases());
  }, []);

  const stats = useMemo(() => {
    const review = cases.filter((item) => item.status === "review").length;
    const avg = cases.length ? Math.round(cases.reduce((sum, item) => sum + item.confidence, 0) / cases.length) : 0;
    return { review, avg, events: allEvents(cases).length };
  }, [cases]);

  return (
    <div>
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow">AI-led commercial insurance workflow</p>
          <h1 className="mt-1 max-w-3xl text-3xl font-black leading-tight">Turn messy applications into underwriter-ready cases.</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="ghost-button" onClick={() => setCases(resetCases())} type="button">
            Reset Demo
          </button>
          <Link className="primary-button" href="/intake">
            New Application
          </Link>
        </div>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Active Cases" value={cases.length} note="in the underwriting queue" />
        <StatCard label="Needs Review" value={stats.review} note="missing context or lower confidence" />
        <StatCard label="Avg. Confidence" value={`${stats.avg}%`} note="AI extraction and triage" />
        <StatCard label="Audit Events" value={stats.events} note="AI and human actions traced" />
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Queue</p>
            <h2 className="text-2xl font-black">AI Case Dashboard</h2>
          </div>
          <p className="max-w-lg text-right text-sm text-muted">Prioritized case queue with risk, missing fields, and status signals.</p>
        </div>

        <div className="shell-card overflow-hidden">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_0.8fr_0.5fr] border-b border-line bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-muted">
            <span>Business</span>
            <span>Coverage</span>
            <span>Risk</span>
            <span>Status</span>
            <span>Conf.</span>
          </div>
          {cases.map((caseItem) => (
            <Link
              className="grid grid-cols-[1.4fr_0.8fr_0.6fr_0.8fr_0.5fr] items-center gap-3 border-b border-line px-4 py-4 text-sm transition hover:bg-blue-50/40 last:border-b-0"
              href={`/cases/${caseItem.id}`}
              key={caseItem.id}
            >
              <span>
                <strong className="block text-base">{caseItem.businessName}</strong>
                <span className="text-xs text-muted">
                  {caseItem.industry} | {caseItem.state} | {caseItem.employees} employees
                </span>
              </span>
              <span className="text-muted">{caseItem.coverage}</span>
              <RiskBadge risk={caseItem.riskLevel} />
              <StatusBadge status={caseItem.status} />
              <strong>{caseItem.confidence}%</strong>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
