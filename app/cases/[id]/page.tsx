import { AppShell } from "@/components/AppShell";
import { CaseDetailClient } from "@/components/CaseDetailClient";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell>
      <CaseDetailClient caseId={id} />
    </AppShell>
  );
}
