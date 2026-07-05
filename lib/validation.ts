import type { IntakeInput, ReviewDecision } from "./types";

const INDUSTRIES = ["Manufacturing", "Restaurant", "Retail", "Construction", "Professional Services"];
const COVERAGES = ["General Liability + Workers Comp", "Business Owner Policy", "General Liability", "Workers Comp", "Cyber Liability"];
const URGENCIES = ["Needs quote this week", "Renewal in 30 days", "Exploring options", "Coverage expired"];

export function parseIntakeInput(value: unknown): { data?: IntakeInput; error?: string } {
  if (!isRecord(value)) return { error: "Invalid intake payload." };

  const businessName = cleanText(value.businessName, 120);
  const industry = cleanChoice(value.industry, INDUSTRIES, "Professional Services");
  const state = cleanText(value.state, 2).toUpperCase();
  const employees = cleanNumber(value.employees, 1, 10000);
  const annualRevenue = cleanNumber(value.annualRevenue, 10000, 1000000000);
  const priorClaims = cleanNumber(value.priorClaims, 0, 1000);
  const coverage = cleanChoice(value.coverage, COVERAGES, "General Liability");
  const urgency = cleanChoice(value.urgency, URGENCIES, "Exploring options");
  const documents = cleanStringArray(value.documents, 12, 180);
  const notes = cleanText(value.notes, 1600);

  if (!businessName) return { error: "Business name is required." };
  if (!/^[A-Z]{2}$/.test(state)) return { error: "State must be a two-letter code." };
  if (!Number.isFinite(employees) || !Number.isFinite(annualRevenue) || !Number.isFinite(priorClaims)) {
    return { error: "Numeric intake fields are invalid." };
  }

  return {
    data: {
      businessName,
      industry,
      state,
      employees,
      annualRevenue,
      priorClaims,
      coverage,
      urgency,
      documents,
      notes
    }
  };
}

export function parseReviewDecision(value: unknown): { data?: ReviewDecision; error?: string } {
  if (!isRecord(value)) return { error: "Invalid review payload." };
  if (value.action !== "approve" && value.action !== "request_info" && value.action !== "reject") {
    return { error: "Invalid review action." };
  }

  return {
    data: {
      action: value.action,
      note: cleanText(value.note, 500) || "No reviewer note provided."
    }
  };
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function cleanChoice(value: unknown, choices: string[], fallback: string) {
  return typeof value === "string" && choices.includes(value) ? value : fallback;
}

function cleanNumber(value: unknown, min: number, max: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return NaN;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function cleanStringArray(value: unknown, maxItems: number, maxItemLength: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => cleanText(item, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
