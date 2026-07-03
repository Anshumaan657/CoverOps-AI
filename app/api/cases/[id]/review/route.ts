import { NextResponse } from "next/server";
import { makeHumanEvent } from "@/lib/mock-ai";
import type { ReviewDecision } from "@/lib/types";

export async function POST(request: Request, context: { params: { id: string } }) {
  const body = (await request.json()) as ReviewDecision;
  if (!["approve", "request_info", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  }

  const actionLabel =
    body.action === "approve"
      ? "Human approved AI summary"
      : body.action === "request_info"
        ? "Human requested more information"
        : "Human rejected AI summary";

  const event = makeHumanEvent(context.params.id, actionLabel, body.note || "No reviewer note provided.");
  return NextResponse.json({ event });
}
