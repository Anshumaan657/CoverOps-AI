# CoverOps AI

**AI-powered commercial insurance intake to underwriter-ready case review.**

CoverOps AI automates the manual workflow behind business insurance submissions: intake review, document signal extraction, risk triage, missing information detection, follow-up generation, human approval, and audit logging.

Status: **Functional MVP** | **Demo-ready** | **Gemini-enabled with local fallback**

## Why This Exists

Commercial insurance operations are still full of manual handoffs: reading intake forms, checking documents, summarizing risk, asking for missing information, and routing cases to underwriters. CoverOps AI shows how that workflow can become software while keeping a human reviewer in control of the final decision.

## Core Workflow

1. Business owner submits a commercial insurance intake.
2. Supporting document names, such as payroll, loss runs, prior policy, or business license, are included in the intake package.
3. Gemini analyzes the intake when `GEMINI_API_KEY` is configured.
4. The system extracts underwriting fields, classifies risk, estimates confidence, flags missing information, and generates follow-up questions.
5. A human reviewer approves, requests more information, or rejects the AI-prepared output.
6. Every system, AI, and human action is saved into an audit log.

The app also includes a deterministic fallback engine, so the demo remains usable without an API key or if Gemini is unavailable.

## Main Features

- **Dashboard**: Prioritized case queue with risk level, status, confidence, and review signals
- **Customer Intake**: Business application form that triggers AI processing
- **Case Detail**: Extracted fields, AI risk summary, missing items, follow-up questions, documents, and decision actions
- **Human Review Queue**: Underwriter-style approval workflow for cases that need review
- **Audit Log**: Chronological trace of system, AI, and human actions

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **AI**: Gemini API using `gemini-3.1-flash-lite`, structured JSON prompting, response validation, and deterministic fallback
- **Storage**: Browser localStorage for demo cases
- **Database-ready**: Supabase/PostgreSQL schema in `supabase/schema.sql`
- **Auth-ready**: Clerk/Supabase placeholders in `.env.example`

## AI Architecture

- `lib/gemini-ai.ts`: Calls Gemini, requests JSON output, validates risk level/confidence/extracted fields, and normalizes missing values
- `lib/mock-ai.ts`: Deterministic fallback engine for demos without an API key or when Gemini fails
- `app/api/intake/route.ts`: Server-side intake route that keeps the API key out of the browser and falls back safely on AI failure
- `lib/local-store.ts`: Local demo persistence with recovery for corrupted localStorage data

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

To use live Gemini processing, add your key to `.env.local`:

```env
GEMINI_API_KEY=your_real_gemini_api_key_here
```

Do not commit `.env.local`.

## Quality Checks

```bash
npm run lint
npm run build
```

## Demo Flow

1. Open the dashboard and inspect the seeded insurance cases.
2. Submit a new business application from Customer Intake.
3. Open the generated case detail page.
4. Review extracted fields, risk level, confidence, missing fields, follow-up questions, and underwriter notes.
5. Approve, request more information, or reject the AI-prepared summary.
6. Open Audit Log to verify the decision trace.

## Design Notes

- Operations dashboard first, marketing site second.
- AI prepares the work; humans make the final decision.
- External AI failure should not break the demo.
- Auditability is part of the workflow, not an afterthought.

## Future Work

- Supabase persistence for cases and audit events
- Supabase Auth or Clerk role-based login
- Real PDF/document parsing instead of document-name simulation
- Voice intake for business owner calls
- Deployed demo link and walkthrough video
