"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCases, saveCases } from "@/lib/local-store";
import type { InsuranceCase, IntakeInput } from "@/lib/types";

const defaults: IntakeInput = {
  businessName: "Cedar Forge Works LLC",
  industry: "Construction",
  state: "TX",
  employees: 34,
  annualRevenue: 2800000,
  priorClaims: 1,
  coverage: "General Liability + Workers Comp",
  urgency: "Needs quote this week",
  documents: ["contractor-license.pdf", "payroll-summary-2026.pdf", "loss-runs-prior-carrier.pdf"],
  notes: "Regional concrete and light commercial contractor with subcontractor crews, jobsite equipment, and a new client contract requiring proof of coverage. Prior claim was a minor worker injury last year."
};

export function IntakeClient() {
  const router = useRouter();
  const [form, setForm] = useState<IntakeInput>(defaults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof IntakeInput>(key: K, value: IntakeInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateDocuments(files: FileList | null) {
    if (!files?.length) return;
    const documents = Array.from(files).map((file) => `${file.name} (${formatFileSize(file.size)})`);
    update("documents", documents);
  }

  async function submit() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("The intake service could not process this application.");
      }

      const payload = (await response.json()) as { case?: InsuranceCase };
      if (!payload.case) {
        throw new Error("The intake service returned an incomplete case.");
      }

      const cases = getCases();
      saveCases([payload.case, ...cases]);
      router.push(`/cases/${payload.case.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong while running AI intake.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header>
        <p className="eyebrow">Customer intake</p>
        <h1 className="mt-1 text-3xl font-black">Create an insurance application.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">This page simulates the business owner intake workflow. The API route returns AI extraction, risk summary, missing fields, and audit events.</p>
      </header>

      {error ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-opsred">
          {error}
        </div>
      ) : null}

      <form
        className="shell-card mt-6 grid gap-5 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <label className="field-label">
            Business name
            <input className="field-input" value={form.businessName} onChange={(event) => update("businessName", event.target.value)} required />
          </label>
          <label className="field-label">
            Industry
            <select className="field-input" value={form.industry} onChange={(event) => update("industry", event.target.value)}>
              {["Manufacturing", "Restaurant", "Retail", "Construction", "Professional Services"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            State
            <input className="field-input" value={form.state} onChange={(event) => update("state", event.target.value.toUpperCase())} maxLength={2} required />
          </label>
          <label className="field-label">
            Employees
            <input className="field-input" type="number" value={form.employees} onChange={(event) => update("employees", Number(event.target.value))} min={1} required />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="field-label">
            Annual revenue
            <input className="field-input" type="number" value={form.annualRevenue} onChange={(event) => update("annualRevenue", Number(event.target.value))} min={10000} required />
          </label>
          <label className="field-label">
            Prior claims
            <input className="field-input" type="number" value={form.priorClaims} onChange={(event) => update("priorClaims", Number(event.target.value))} min={0} required />
          </label>
          <label className="field-label">
            Coverage
            <select className="field-input" value={form.coverage} onChange={(event) => update("coverage", event.target.value)}>
              {["General Liability + Workers Comp", "Business Owner Policy", "General Liability", "Workers Comp", "Cyber Liability"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Urgency
            <select className="field-input" value={form.urgency} onChange={(event) => update("urgency", event.target.value)}>
              {["Needs quote this week", "Renewal in 30 days", "Exploring options", "Coverage expired"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-label">
          Uploaded documents
          <label className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-slate-50 px-5 py-6 text-center transition hover:border-opsblue hover:bg-blue-50/40">
            <span className="text-sm font-black text-ink">Upload insurance documents</span>
            <span className="mt-1 max-w-xl text-xs font-semibold leading-5 text-muted">PDF, CSV, XLSX, DOCX, or image files. This MVP captures file names, sizes, and document signals for AI triage; full PDF text extraction is listed in future work.</span>
            <input
              accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg"
              className="sr-only"
              multiple
              onChange={(event) => updateDocuments(event.target.files)}
              type="file"
            />
          </label>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {form.documents.map((document) => (
              <div className="rounded-lg border border-line bg-white p-3 text-xs font-black text-ink" key={document}>
                {document}
              </div>
            ))}
          </div>
        </div>

        <label className="field-label">
          Business notes
          <textarea className="field-input min-h-32" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
        </label>

        <div className="flex flex-wrap justify-end gap-3">
          <button className="ghost-button" type="button" onClick={() => setForm(defaults)}>
            Load Demo
          </button>
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Running AI intake..." : "Run AI Intake"}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
