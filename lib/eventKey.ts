import type { TWEvent } from "./types";

// A stable, URL-safe key for an event, derived from its (stable) RSVP URL.
// Used to group community ticket/address posts in Blob storage.
export function eventKey(ev: Pick<TWEvent, "url">): string {
  return ev.url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
