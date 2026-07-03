"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RiskBadge } from "@/components/Badges";
import { getCases } from "@/lib/local-store";
import type { InsuranceCase } from "@/lib/types";

export function ReviewClient() {
  const [cases, setCases] = useState<InsuranceCase[]>([]);

  useEffect(() => {
    setCases(getCases().filter((caseItem) => caseItem.status === "review"));
  }, []);

  return (
    <div>
      <header>
        <p className="eyebrow">Human-in-the-loop</p>
        <h1 className="mt-1 text-3xl font-black">Review Queue</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Low-confidence or incomplete AI summaries are routed here for underwriter approval, rejection, or follow-up.</p>
      </header>

      <section className="shell-card mt-6 overflow-hidden">
        {cases.length ? cases.map((caseItem) => (
          <Link className="grid gap-4 border-b border-line p-5 transition hover:bg-blue-50/40 last:border-b-0 md:grid-cols-[1fr_auto]" href={`/cases/${caseItem.id}`} key={caseItem.id}>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black">{caseItem.businessName}</h2>
                <RiskBadge risk={caseItem.riskLevel} />
              </div>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">{caseItem.underwriterSummary}</p>
              <p className="mt-2 text-xs font-bold text-muted">Missing: {caseItem.missingFields.join(", ") || "None"} | Confidence {caseItem.confidence}%</p>
            </div>
            <span className="primary-button self-center text-center">Open Review</span>
          </Link>
        )) : (
          <div className="p-10 text-center">
            <h2 className="text-xl font-black">Review queue is clear</h2>
            <p className="mt-2 text-muted">New review cases will appear here after intake.</p>
          </div>
        )}
      </section>
    </div>
  );
}
