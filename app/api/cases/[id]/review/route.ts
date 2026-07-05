import { NextResponse } from "next/server";
import { makeHumanEvent } from "@/lib/mock-ai";
import { parseReviewDecision } from "@/lib/validation";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
  }

  const parsed = parseReviewDecision(payload);
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error || "Invalid review payload." }, { status: 400 });
  }

  if (!/^COV-\d{4}$/.test(id)) {
    return NextResponse.json({ error: "Invalid case id." }, { status: 400 });
  }

  const actionLabel =
    parsed.data.action === "approve"
      ? "Human approved AI summary"
      : parsed.data.action === "request_info"
        ? "Human requested more information"
        : "Human rejected AI summary";

  const event = makeHumanEvent(id, actionLabel, parsed.data.note);
  return NextResponse.json({ event });
}
