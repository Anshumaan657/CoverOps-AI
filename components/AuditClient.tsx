"use client";

import { useEffect, useState } from "react";
import { allEvents, getCases } from "@/lib/local-store";
import type { AuditEvent } from "@/lib/types";

export function AuditClient() {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    setEvents(allEvents(getCases()));
  }, []);

  return (
    <div>
      <header>
        <p className="eyebrow">Traceability</p>
        <h1 className="mt-1 text-3xl font-black">Audit Log</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Every AI extraction, risk score, follow-up, and human override is captured for review.</p>
      </header>

      <section className="shell-card mt-6 overflow-hidden">
        {events.map((event) => (
          <div className="grid gap-3 border-b border-line p-4 last:border-b-0 md:grid-cols-[170px_1fr_130px]" key={event.id}>
            <p className="text-xs font-bold text-muted">{new Date(event.createdAt).toLocaleString()}</p>
            <div>
              <p className="font-black">{event.action}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{event.detail}</p>
            </div>
            <div className="text-xs font-black uppercase text-muted">
              {event.caseId}
              <br />
              {event.actor}
              {event.confidence ? ` / ${event.confidence}%` : ""}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
