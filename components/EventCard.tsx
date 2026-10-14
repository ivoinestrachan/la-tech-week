"use client";

import { useState } from "react";
import type { TWEvent, CategoryMeta } from "@/lib/types";
import type { TimeStatus } from "@/lib/time";
import { catColor } from "@/lib/colors";
import { eventKey } from "@/lib/eventKey";
import { TicketModal } from "@/components/TicketModal";

export function EventCard({
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
  const statusBadge = ev.featured
    ? { label: "Featured", cls: "bg-orange/15 text-orange" }
    : ev.closed || ev.canceled
      ? { label: ev.canceled ? "Canceled" : "Closed", cls: "bg-coral/15 text-coral" }
      : ev.waitlist
        ? { label: "Waitlist", cls: "bg-cyan/15 text-cyan" }
        : null;

  return (
    <div
      style={{ ["--cat" as string]: color }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.04] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-lineStrong hover:bg-white/[0.07] ${
        isPast ? "opacity-45" : ev.closed || ev.canceled ? "opacity-60" : ""
      }`}
    >
      {/* stretched link — whole card opens the RSVP page */}
      <a
        href={ev.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${ev.title} RSVP page`}
        className="absolute inset-0 z-0"
      />
      <span
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[2px] opacity-55"
        style={{ background: color }}
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {status === "live" ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#4ade80]/15 px-2 py-1 font-display text-[11.5px] font-semibold tracking-wide text-[#6fe39a]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              </span>
              LIVE NOW
            </span>
          ) : status === "soon" ? (
            <span className="rounded-md bg-[#ffa23a]/15 px-2 py-1 font-display text-[11.5px] font-semibold tracking-wide text-[#ffb866]">
              SOON · {ev.time}
            </span>
          ) : (
            <span className="rounded-md bg-white/[0.07] px-2 py-1 font-display text-[11.5px] font-semibold tracking-wide">
              {ev.dayShort} · {ev.time}
              {isPast && <span className="ml-1 text-muted2">· ended</span>}
            </span>
          )}
          {ev.best && (
            <span
              title={ev.bestReasons?.join(" · ")}
              className="inline-flex items-center gap-1 rounded-md border border-[#d9b44a]/40 bg-[#d9b44a]/12 px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-wider text-[#e3c360]"
            >
              ★ Best
            </span>
          )}
          {statusBadge && (
            <span
              className={`ml-auto rounded-md px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-wider ${statusBadge.cls}`}
            >
              {statusBadge.label}
            </span>
          )}
        </div>

        <h3 className="mb-2 font-display text-[16.5px] font-semibold leading-tight">
          {ev.title || "Untitled event"}
        </h3>
        <p className="mb-4 line-clamp-2 text-[13px] text-muted">{ev.host}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border px-[9px] py-[3px] text-[11.5px]"
            style={{
              color,
              borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
            }}
          >
            {category?.emoji} {category?.label ?? ev.category}
          </span>
          <span className="rounded-full border border-line px-[7px] py-[2px] text-[10.5px] uppercase tracking-wide text-muted2">
            {sourceLabel}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {ev.neighborhood}
          </span>
        </div>

        {/* community tickets & address board */}
        <button
          type="button"
          onClick={() => setShowTickets(true)}
          className="pointer-events-auto relative z-20 mt-3 w-full rounded-lg border border-line bg-white/[0.03] py-2 text-[12.5px] text-muted transition-colors hover:border-lineStrong hover:text-ink"
        >
          🎟 Tickets &amp; address
        </button>
      </div>

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
