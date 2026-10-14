"use client";

import { useState } from "react";
import type { TWEvent, CategoryMeta } from "@/lib/types";
import type { TimeStatus } from "@/lib/time";
import { catColor } from "@/lib/colors";
import { eventKey } from "@/lib/eventKey";
import { TicketModal } from "@/components/TicketModal";

export function EventRow({
  ev,
  category,
  status,
}: {
  ev: TWEvent;
  category?: CategoryMeta;
  status?: TimeStatus;
}) {
  const [showTickets, setShowTickets] = useState(false);
  const color = catColor(ev.category);
  const isPast = status === "past";
  const sourceLabel =
    ev.source === "luma" ? "Luma" : ev.source === "partiful" ? "Partiful" : "Tech Week";

  return (
    <div
      className={`group relative flex items-center gap-3 border-b border-line px-2 py-2.5 transition-colors last:border-b-0 hover:bg-white/[0.03] sm:gap-4 sm:px-3 ${
        isPast ? "opacity-45" : ev.closed || ev.canceled ? "opacity-60" : ""
      }`}
    >
      <a
        href={ev.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${ev.title} RSVP page`}
        className="absolute inset-0 z-0"
      />

      {/* time column */}
      <div className="pointer-events-none relative z-10 w-[62px] shrink-0 sm:w-[76px]">
        {status === "live" ? (
          <span className="inline-flex items-center gap-1 font-display text-[12px] font-semibold text-[#6fe39a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" /> Live
          </span>
        ) : status === "soon" ? (
          <span className="font-display text-[12.5px] font-semibold text-[#ffb866]">
            {ev.time}
          </span>
        ) : (
          <span className="font-display text-[12.5px] font-medium text-muted">{ev.time}</span>
        )}
      </div>

      {/* category dot */}
      <span
        className="pointer-events-none relative z-10 hidden h-2 w-2 shrink-0 rounded-full sm:block"
        style={{ background: color }}
        title={category?.label}
      />

      {/* title + host */}
      <div className="pointer-events-none relative z-10 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-medium text-ink">
            {ev.title || "Untitled event"}
          </span>
          {ev.best && (
            <span
              title={ev.bestReasons?.join(" · ")}
              className="shrink-0 rounded border border-[#d9b44a]/40 bg-[#d9b44a]/12 px-1.5 py-[1px] text-[9.5px] font-semibold uppercase tracking-wider text-[#e3c360]"
            >
              ★
            </span>
          )}
          {(ev.closed || ev.canceled) && (
            <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wider text-coral">
              {ev.canceled ? "Canceled" : "Closed"}
            </span>
          )}
          {ev.waitlist && !ev.closed && (
            <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wider text-cyan">
              Waitlist
            </span>
          )}
        </div>
        <div className="truncate text-[12px] text-muted2">
          {ev.host}
          <span className="mx-1.5 opacity-40">·</span>
          {ev.neighborhood}
          <span className="mx-1.5 hidden opacity-40 sm:inline">·</span>
          <span className="hidden opacity-70 sm:inline">{sourceLabel}</span>
        </div>
      </div>

      {/* ticket button */}
      <button
        type="button"
        onClick={() => setShowTickets(true)}
        title="Tickets & address"
        className="pointer-events-auto relative z-20 shrink-0 rounded-lg border border-line px-2 py-1.5 text-[13px] text-muted transition-colors hover:border-lineStrong hover:text-ink"
      >
        🎟
      </button>

      {showTickets && (
        <TicketModal
          eventKey={eventKey(ev)}
          eventTitle={ev.title || "Untitled event"}
          onClose={() => setShowTickets(false)}
        />
      )}
    </div>
  );
}
