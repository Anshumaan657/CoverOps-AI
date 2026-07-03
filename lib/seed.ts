import { runMockIntake } from "./mock-ai";
import type { InsuranceCase } from "./types";

export const seedCases: InsuranceCase[] = [
  runMockIntake({
    businessName: "Northstar Fabrication LLC",
    industry: "Manufacturing",
    state: "CA",
    employees: 42,
    annualRevenue: 4200000,
    priorClaims: 1,
    coverage: "General Liability + Workers Comp",
    urgency: "Needs quote this week",
    documents: ["business-license.pdf", "payroll-summary-2026.pdf", "loss-runs-prior-carrier.pdf"],
    notes: "Metal fabrication shop with welding operations, delivery vehicles, and a new customer contract requiring proof of coverage. Prior claim was a minor worker injury last year."
  }),
  runMockIntake({
    businessName: "Harbor Table Group",
    industry: "Restaurant",
    state: "NY",
    employees: 28,
    annualRevenue: 1850000,
    priorClaims: 0,
    coverage: "Business Owner Policy",
    urgency: "Renewal in 30 days",
    documents: ["lease-agreement.pdf", "prior-policy.pdf", "sales-summary.pdf"],
    notes: "Neighborhood restaurant with delivery apps, weekend alcohol sales, and no reported claims. Owner wants BOP and liquor liability guidance before renewal."
  })
];
