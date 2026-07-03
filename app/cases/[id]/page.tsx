import { AppShell } from "@/components/AppShell";
import { CaseDetailClient } from "@/components/CaseDetailClient";

export default function CasePage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <CaseDetailClient caseId={params.id} />
    </AppShell>
  );
}
