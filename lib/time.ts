import type { TWEvent } from "./types";

export type TimeStatus = "past" | "live" | "soon" | "upcoming";

// Events only have a start time, so we assume a typical ~2.5h run for "live",
// and flag anything starting within the next hour as "soon".
const LIVE_WINDOW_MS = 2.5 * 60 * 60 * 1000;
const SOON_WINDOW_MS = 60 * 60 * 1000;

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function eventStart(ev: TWEvent): Date {
  const [y, m, d] = ev.day.split("-").map(Number);
  const h = Math.floor(ev.minutes / 60);
  const min = ev.minutes % 60;
  return new Date(y, m - 1, d, h, min, 0, 0);
}

export function eventStatus(ev: TWEvent, now: Date): TimeStatus {
  const today = toISODate(now);
  if (ev.day < today) return "past";
  if (ev.day > today) {
    const diff = eventStart(ev).getTime() - now.getTime();
    return diff <= SOON_WINDOW_MS ? "soon" : "upcoming";
  }
  // same day
  if (ev.minutes >= 9999) return "upcoming"; // unknown time → keep visible today
  const diff = eventStart(ev).getTime() - now.getTime();
  if (diff > 0) return diff <= SOON_WINDOW_MS ? "soon" : "upcoming";
  return now.getTime() - eventStart(ev).getTime() <= LIVE_WINDOW_MS ? "live" : "past";
}

export function isPastDay(dayISO: string, now: Date): boolean {
  return dayISO < toISODate(now);
}

export function isToday(dayISO: string, now: Date): boolean {
  return dayISO === toISODate(now);
}

export function formatClock(now: Date): string {
  return now.toLocaleTimeString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
