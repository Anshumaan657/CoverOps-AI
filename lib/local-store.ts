"use client";

import { seedCases } from "./seed";
import type { AuditEvent, InsuranceCase } from "./types";

const CASES_KEY = "coverops-ai-cases";

export function getCases(): InsuranceCase[] {
  if (typeof window === "undefined") return seedCases;
  const saved = window.localStorage.getItem(CASES_KEY);
  if (!saved) {
    window.localStorage.setItem(CASES_KEY, JSON.stringify(seedCases));
    return seedCases;
  }

  try {
    const parsed = JSON.parse(saved) as InsuranceCase[];
    return Array.isArray(parsed) ? parsed : resetCases();
  } catch {
    return resetCases();
  }
}

export function saveCases(cases: InsuranceCase[]) {
  window.localStorage.setItem(CASES_KEY, JSON.stringify(cases));
}

export function resetCases() {
  window.localStorage.setItem(CASES_KEY, JSON.stringify(seedCases));
  return seedCases;
}

export function allEvents(cases: InsuranceCase[]): AuditEvent[] {
  return cases.flatMap((caseItem) => caseItem.audit).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
