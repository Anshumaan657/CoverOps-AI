# CoverOps AI

**AI that turns messy commercial insurance intake into underwriter-ready cases.**

CoverOps AI automates the manual parts of business insurance submissions: intake processing, document upload, risk triage, missing information detection, follow-up generation, human review, and audit logging.

**Status**: Functional MVP | Fully working demo | Gemini-powered with deterministic local fallback

## Why It Exists

Commercial insurance ops are still mostly manual. Underwriters and operators read forms, chase documents, assess risk, summarize accounts, and ask for missing details. CoverOps AI turns that workflow into a clean software system without removing human judgment from final decisions.

## Core Workflow

1. Business owner submits an intake form with supporting documents such as payroll, loss runs, prior policies, and licenses.
2. The system extracts key underwriting fields, scores risk, flags gaps, and suggests follow-up questions.
3. A human reviewer approves, requests more information, or rejects the AI-prepared output.
4. The audit log captures every system, AI, and human action.

The demo works without external services using a deterministic fallback engine. Add a real Gemini key for live AI processing.

> Note: the current version uses uploaded file metadata for triage. Full PDF/document text extraction is planned.

## Features

- **Dashboard**: Prioritized queue with risk, confidence, and status
- **Customer Intake**: Business form plus document upload that starts AI processing
- **Case Detail**: Extracted data, risk summary, missing items, follow-ups, documents, and AI decision trace
- **Human Review**: Underwriter queue for approve, reject, or request-more-info decisions
- **Audit Log**: Chronological history of system, AI, and human actions

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **AI**: Gemini using structured output, validation, and deterministic fallback
- **Storage**: localStorage for the demo; Supabase/Postgres-ready schema included
- **Auth-ready**: Clerk/Supabase placeholders in `.env.example`

## Architecture Highlights

- `lib/gemini-ai.ts`: Live Gemini calls with structured JSON output and validation
- `lib/mock-ai.ts`: Deterministic fallback so the demo still works without an API key
- `app/api/intake/route.ts`: Server-side intake processing; API key never reaches the browser
- `lib/validation.ts`: Server-side validation and sanitization for intake/review payloads
- `lib/local-store.ts`: Local demo persistence with recovery for corrupted localStorage data
- `components/CaseDetailClient.tsx`: AI decision trace with inputs, risk factors, missing fields, confidence reason, and processing engine

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit:

```text
http://localhost:3000
```

Add your Gemini key to `.env.local` for live AI:

```env
GEMINI_API_KEY=your_key_here
```

Do not commit `.env.local`.

## Quality Checks

```bash
npm run lint
npm run build
```

## Demo Flow

Use a fresh Incognito/private window for the cleanest demo.

1. Open the dashboard and inspect the seeded cases.
2. Create a new intake and upload document files.
3. Review the AI-generated case summary, missing fields, follow-ups, and decision trace.
4. Approve, reject, or request more information.
5. Open the audit log and verify the decision trail.

## Design Choices

- Dashboard-first, because this is built for insurance operators rather than a marketing page.
- AI assists; humans decide.
- The demo must work without external dependencies.
- Auditability is built into the workflow, not added later.

## Future Work

- Supabase persistence and real auth
- Full PDF/document text extraction
- Voice intake
- Deployed live demo
- Short walkthrough video

## License

MIT
