export type CaseStatus = "new" | "review" | "approved" | "rejected";
export type RiskLevel = "low" | "medium" | "high";

export type IntakeInput = {
  businessName: string;
  industry: string;
  state: string;
  employees: number;
  annualRevenue: number;
  priorClaims: number;
  coverage: string;
  urgency: string;
  documents: string[];
  notes: string;
};

export type ExtractedFields = {
  operations: string;
  payroll: string;
  lossHistory: string;
  coverageNeed: string;
  complianceFlags: string;
};

export type AuditEvent = {
  id: string;
  caseId: string;
  actor: "ai" | "human" | "system";
  action: string;
  detail: string;
  confidence?: number;
  createdAt: string;
};

export type InsuranceCase = IntakeInput & {
  id: string;
  status: CaseStatus;
  riskLevel: RiskLevel;
  confidence: number;
  missingFields: string[];
  extracted: ExtractedFields;
  underwriterSummary: string;
  followUpQuestions: string[];
  createdAt: string;
  updatedAt: string;
  audit: AuditEvent[];
};

export type ReviewDecision = {
  action: "approve" | "request_info" | "reject";
  note: string;
};
