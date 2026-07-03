import { GoogleGenAI } from "@google/genai";
import type { ExtractedFields, InsuranceCase, IntakeInput, RiskLevel } from "./types";

export async function runGeminiIntake(input: IntakeInput): Promise<InsuranceCase> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are an AI insurance operations assistant.

Analyze this commercial insurance intake and return only valid JSON.

Intake:
${JSON.stringify(input, null, 2)}

Return:
- riskLevel: low, medium, or high
- confidence: number from 0 to 100
- missingFields: string[]
- extracted: operations, payroll, lossHistory, coverageNeed, complianceFlags
- underwriterSummary: concise underwriter-ready summary
- followUpQuestions: string[]
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const parsed = normalizeGeminiOutput(response.text || "{}", input);

  const caseId = `COV-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  return {
    ...input,
    id: caseId,
    status: parsed.missingFields?.length || parsed.riskLevel !== "low" ? "review" : "approved",
    riskLevel: parsed.riskLevel,
    confidence: parsed.confidence,
    missingFields: parsed.missingFields,
    extracted: parsed.extracted,
    underwriterSummary: parsed.underwriterSummary,
    followUpQuestions: parsed.followUpQuestions,
    createdAt: now,
    updatedAt: now,
    audit: [
      {
        id: `evt-${Date.now()}-1`,
        caseId,
        actor: "system",
        action: "Application received",
        detail: "Business owner submitted intake form and document package.",
        createdAt: now
      },
      {
        id: `evt-${Date.now()}-2`,
        caseId,
        actor: "ai",
        action: "AI risk analysis completed",
        detail: `${parsed.riskLevel?.toUpperCase()} risk classification with ${parsed.confidence}% confidence.`,
        confidence: parsed.confidence,
        createdAt: now
      }
    ]
  };
}

type GeminiIntakeOutput = {
  riskLevel: RiskLevel;
  confidence: number;
  missingFields: string[];
  extracted: ExtractedFields;
  underwriterSummary: string;
  followUpQuestions: string[];
};

function normalizeGeminiOutput(rawText: string, input: IntakeInput): GeminiIntakeOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Gemini returned an invalid response shape.");
  }

  const riskLevel = normalizeRiskLevel(parsed.riskLevel);
  const confidence = normalizeConfidence(parsed.confidence);
  const missingFields = normalizeStringArray(parsed.missingFields);
  const extracted = normalizeExtractedFields(parsed.extracted, input);
  const underwriterSummary =
    typeof parsed.underwriterSummary === "string" && parsed.underwriterSummary.trim()
      ? parsed.underwriterSummary.trim()
      : `${input.businessName} is a ${riskLevel}-risk ${input.industry.toLowerCase()} account seeking ${input.coverage}.`;
  const followUpQuestions = normalizeStringArray(parsed.followUpQuestions);

  return {
    riskLevel,
    confidence,
    missingFields,
    extracted,
    underwriterSummary,
    followUpQuestions
  };
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function normalizeConfidence(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 72;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function normalizeExtractedFields(value: unknown, input: IntakeInput): ExtractedFields {
  const extracted = isRecord(value) ? value : {};
  return {
    operations: readString(extracted.operations, `${input.industry} operation in ${input.state}.`),
    payroll: readString(extracted.payroll, "Payroll details require underwriter validation."),
    lossHistory: readString(extracted.lossHistory, `${input.priorClaims} prior claim(s) disclosed by applicant.`),
    coverageNeed: readString(extracted.coverageNeed, input.coverage),
    complianceFlags: readString(extracted.complianceFlags, "No immediate compliance blocker detected.")
  };
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
