"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RiskBadge, StatusBadge } from "@/components/Badges";
import { getCases, saveCases } from "@/lib/local-store";
import type { AuditEvent, CaseStatus, InsuranceCase, ReviewDecision } from "@/lib/types";

export function CaseDetailClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [cases, setCases] = useState<InsuranceCase[]>([]);
  const caseItem = useMemo(() => cases.find((item) => item.id === caseId), [caseId, cases]);

  useEffect(() => {
    setCases(getCases());
  }, []);

  async function review(action: ReviewDecision["action"]) {
    if (!caseItem) return;
    const note =
      action === "approve"
        ? "Reviewer approved AI-prepared underwriting summary."
        : action === "request_info"
          ? `Reviewer requested: ${caseItem.followUpQuestions[0] || "additional information"}.`
          : "Reviewer rejected the AI output and returned the case to intake.";

    const response = await fetch(`/api/cases/${caseItem.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note })
    });
    if (!response.ok) return;

    const payload = (await response.json()) as { event: AuditEvent };
    const nextStatus: CaseStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "review";
    const next = cases.map((item) =>
      item.id === caseItem.id
        ? {
            ...item,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            audit: [payload.event, ...item.audit]
          }
        : item
    );
    setCases(next);
    saveCases(next);
  }

  if (!caseItem) {
    return (
      <div className="shell-card p-8">
        <h1 className="text-2xl font-black">Case not found</h1>
        <p className="mt-2 text-muted">The case may not exist in local demo storage.</p>
        <Link className="primary-button mt-5 inline-flex" href="/">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow">{caseItem.id}</p>
          <h1 className="mt-1 text-3xl font-black">{caseItem.businessName}</h1>
          <p className="mt-2 text-sm text-muted">
            {caseItem.industry} | {caseItem.state} | {caseItem.coverage}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RiskBadge risk={caseItem.riskLevel} />
          <StatusBadge status={caseItem.status} />
        </div>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <Info label="Revenue" value={currency(caseItem.annualRevenue)} />
        <Info label="Employees" value={String(caseItem.employees)} />
        <Info label="Prior Claims" value={String(caseItem.priorClaims)} />
        <Info label="Confidence" value={`${caseItem.confidence}%`} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="shell-card p-5">
          <p className="eyebrow">Underwriter notes</p>
          <h2 className="mt-1 text-xl font-black">AI Risk Summary</h2>
          <p className="mt-4 rounded-lg border-l-4 border-opsblue bg-blue-50 p-4 leading-7">{caseItem.underwriterSummary}</p>

          <div className="mt-5">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-teal-600" style={{ width: `${caseItem.confidence}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">{caseItem.confidence}% confidence after intake validation and document extraction.</p>
          </div>
        </div>

        <div className="shell-card p-5">
          <p className="eyebrow">Human review</p>
          <h2 className="mt-1 text-xl font-black">Decision Actions</h2>
          <div className="mt-5 grid gap-3">
            <button className="primary-button" onClick={() => void review("approve")} type="button">
              Approve AI Summary
            </button>
            <button className="ghost-button" onClick={() => void review("request_info")} type="button">
              Request More Info
            </button>
            <button className="danger-button" onClick={() => void review("reject")} type="button">
              Reject Output
            </button>
          </div>
          <button className="ghost-button mt-4 w-full" onClick={() => router.push("/audit")} type="button">
            View Decision Trace
          </button>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Extracted Fields" eyebrow="Document extraction">
          <div className="grid gap-3">
            {Object.entries(caseItem.extracted).map(([key, value]) => (
              <div className="rounded-lg border border-line bg-slate-50 p-3" key={key}>
                <p className="text-xs font-black uppercase tracking-wide text-muted">{labelize(key)}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Follow-ups & Missing Fields" eyebrow="Agent output">
          <div className="mb-4 flex flex-wrap gap-2">
            {caseItem.missingFields.length ? caseItem.missingFields.map((field) => <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-opsamber" key={field}>{field}</span>) : <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-opsgreen">No missing fields</span>}
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
            {caseItem.followUpQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="mt-5">
        <Panel title="Uploaded Documents" eyebrow="Inputs">
          <div className="grid gap-2 md:grid-cols-3">
            {caseItem.documents.map((document) => (
              <div className="rounded-lg border border-line bg-white p-3 text-sm font-bold" key={document}>{document}</div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="shell-card p-4">
      <p className="text-xs font-bold text-muted">{label}</p>
      <strong className="mt-1 block text-lg">{value}</strong>
    </div>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="shell-card p-5">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mb-4 mt-1 text-xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function labelize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
