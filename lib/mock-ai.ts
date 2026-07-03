import type { AuditEvent, ExtractedFields, InsuranceCase, IntakeInput, RiskLevel } from "./types";

function id(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function audit(caseId: string, actor: AuditEvent["actor"], action: string, detail: string, confidence?: number): AuditEvent {
  return {
    id: id("evt"),
    caseId,
    actor,
    action,
    detail,
    confidence,
    createdAt: timestamp()
  };
}

function detectMissingFields(input: IntakeInput) {
  const docs = input.documents.join(" ").toLowerCase();
  const notes = input.notes.toLowerCase();
  const missing: string[] = [];

  if (!docs.includes("loss")) missing.push("loss runs");
  if (!docs.includes("payroll")) missing.push("payroll summary");
  if (!docs.includes("license")) missing.push("business license");
  if (input.industry === "Restaurant" && !notes.includes("alcohol")) missing.push("liquor exposure");
  if (input.industry === "Construction" && !notes.includes("subcontractor")) missing.push("subcontractor certificates");
  if (input.industry === "Manufacturing" && !notes.includes("safety")) missing.push("safety program");

  return Array.from(new Set(missing)).slice(0, 4);
}

function scoreRisk(input: IntakeInput, missingFields: string[]): RiskLevel {
  const highExposure = ["Manufacturing", "Construction"].includes(input.industry);
  const points =
    (highExposure ? 2 : 0) +
    (input.priorClaims > 0 ? 2 : 0) +
    (input.employees > 40 ? 1 : 0) +
    (input.annualRevenue > 3000000 ? 1 : 0) +
    (missingFields.length > 2 ? 1 : 0);

  if (points >= 5) return "high";
  if (points >= 2) return "medium";
  return "low";
}

function confidenceFor(riskLevel: RiskLevel, missingFields: string[]) {
  const base = riskLevel === "high" ? 82 : riskLevel === "medium" ? 88 : 93;
  return Math.max(64, base - missingFields.length * 5);
}

function extractedFields(input: IntakeInput): ExtractedFields {
  const docs = input.documents.join(" ").toLowerCase();
  return {
    operations: `${input.industry} operation in ${input.state}; ${input.notes.slice(0, 130)}${input.notes.length > 130 ? "..." : ""}`,
    payroll: docs.includes("payroll") ? "Payroll evidence uploaded and ready for underwriter validation." : "Payroll evidence missing from uploaded documents.",
    lossHistory: input.priorClaims > 0 ? `${input.priorClaims} prior claim(s) disclosed by applicant.` : "No prior claims disclosed by applicant.",
    coverageNeed: input.coverage,
    complianceFlags: input.urgency.includes("expired") ? "Urgent: coverage may be expired." : "No immediate compliance blocker detected."
  };
}

function followUps(input: IntakeInput, missingFields: string[]) {
  const questions = missingFields.map((field) => `Please provide ${field} for underwriting review.`);
  if (input.industry === "Manufacturing") questions.push("What percentage of operations involve welding, cutting, or high-heat work?");
  if (input.industry === "Restaurant") questions.push("What percentage of revenue comes from alcohol sales and delivery?");
  if (input.industry === "Construction") questions.push("Do subcontractors carry their own certificates of insurance?");
  return questions.slice(0, 5);
}

function summary(input: IntakeInput, riskLevel: RiskLevel, missingFields: string[]) {
  const missing = missingFields.length ? `Missing items: ${missingFields.join(", ")}.` : "No material missing items detected.";
  return `${input.businessName} is a ${riskLevel}-risk ${input.industry.toLowerCase()} account seeking ${input.coverage}. The AI prepared an underwriter-ready summary from intake answers and uploaded document names. ${missing}`;
}

export function runMockIntake(input: IntakeInput): InsuranceCase {
  const caseId = id("COV");
  const missingFields = detectMissingFields(input);
  const riskLevel = scoreRisk(input, missingFields);
  const confidence = confidenceFor(riskLevel, missingFields);
  const now = timestamp();

  const events = [
    audit(caseId, "system", "Application received", "Business owner submitted intake form and document package."),
    audit(caseId, "ai", "Document extraction completed", `${input.documents.length} document name(s) parsed into structured underwriting fields.`, confidence),
    audit(caseId, "ai", "Risk triage completed", `${riskLevel.toUpperCase()} risk classification with ${confidence}% confidence.`, confidence),
    audit(caseId, "ai", "Follow-up questions generated", `${missingFields.length} missing field(s) identified for underwriter review.`, confidence)
  ];

  return {
    ...input,
    id: caseId,
    status: missingFields.length || riskLevel !== "low" ? "review" : "approved",
    riskLevel,
    confidence,
    missingFields,
    extracted: extractedFields(input),
    underwriterSummary: summary(input, riskLevel, missingFields),
    followUpQuestions: followUps(input, missingFields),
    createdAt: now,
    updatedAt: now,
    audit: events
  };
}

export function makeHumanEvent(caseId: string, action: string, detail: string): AuditEvent {
  return audit(caseId, "human", action, detail);
}
