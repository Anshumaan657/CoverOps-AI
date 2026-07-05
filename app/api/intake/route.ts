import { NextResponse } from "next/server";
import { runGeminiIntake } from "@/lib/gemini-ai";
import { runMockIntake } from "@/lib/mock-ai";
import { parseIntakeInput } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid intake payload." }, { status: 400 });
  }

  const parsed = parseIntakeInput(payload);
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error || "Invalid intake payload." }, { status: 400 });
  }

  try {
    const generatedCase = await runGeminiIntake(parsed.data);

    return NextResponse.json({ case: generatedCase, provider: "gemini" });
  } catch (error) {
    const fallbackCase = runMockIntake(parsed.data);
    fallbackCase.audit = [
      {
        id: `evt-${Date.now()}-fallback`,
        caseId: fallbackCase.id,
        actor: "system",
        action: "Gemini unavailable",
        detail: error instanceof Error ? `Fallback engine used: ${error.message}` : "Fallback engine used because Gemini failed.",
        createdAt: new Date().toISOString()
      },
      ...fallbackCase.audit
    ];

    return NextResponse.json({ case: fallbackCase, provider: "fallback" });
  }
}
