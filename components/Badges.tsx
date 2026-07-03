import type { CaseStatus, RiskLevel } from "@/lib/types";

export function StatusBadge({ status }: { status: CaseStatus }) {
  const styles = {
    new: "bg-blue-50 text-opsblue",
    review: "bg-amber-50 text-opsamber",
    approved: "bg-green-50 text-opsgreen",
    rejected: "bg-red-50 text-opsred"
  };
  const labels = {
    new: "New",
    review: "Needs Review",
    approved: "Approved",
    rejected: "Rejected"
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${styles[status]}`}>{labels[status]}</span>;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles = {
    low: "bg-green-50 text-opsgreen",
    medium: "bg-amber-50 text-opsamber",
    high: "bg-red-50 text-opsred"
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${styles[risk]}`}>{risk.toUpperCase()} RISK</span>;
}
