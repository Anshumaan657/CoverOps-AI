import { NextResponse } from "next/server";
import { runGeminiIntake } from "@/lib/gemini-ai";
import { runMockIntake } from "@/lib/mock-ai";
import type { IntakeInput } from "@/lib/types";

export async function POST(request: Request) {
  let body: IntakeInput;
  try {
    body = (await request.json()) as IntakeInput;
  } catch {
    return NextResponse.json({ error: "Invalid intake payload." }, { status: 400 });
  }

  try {
    const generatedCase = await runGeminiIntake(body);

    return NextResponse.json({ case: generatedCase, provider: "gemini" });
  } catch (error) {
    const fallbackCase = runMockIntake(body);
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
