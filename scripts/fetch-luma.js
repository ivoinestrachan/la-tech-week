// Fetches LA Tech Week events from the official Luma calendar (luma.com/latw)
// via Luma's public API, windowed to Oct 12–18 2026, and writes data/luma.raw.json.
// Run: node scripts/fetch-luma.js
const fs = require("fs");
const path = require("path");

const CAL = "cal-BVYkgFSqxs8DEOL"; // luma.com/latw
const WIN_START = "2026-10-12";
const WIN_END = "2026-10-18";
const OUT = path.join(__dirname, "..", "data", "luma.raw.json");

function laParts(iso) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(d);
  const g = (t) => parts.find((x) => x.type === t)?.value;
  const day = `${g("year")}-${g("month")}-${g("day")}`;
  const h = parseInt(g("hour"), 10);
  const min = g("minute");
  const ap = g("dayPeriod").toLowerCase();
  return { day, time: `${h}:${min}${ap}` };
}

function mapEntry(e) {
  const ev = e.event;
  const { day, time } = laParts(ev.start_at);
  const geo = ev.geo_address_info || {};
  const status = [];
  if (e.waitlist_active) status.push("Waitlist");
  if (e.ticket_info?.is_sold_out) status.push("Closed");
  if (e.registration_availability === "closed") status.push("Closed");
  return {
    day,
    time,
    title: (ev.name || "").trim(),
    host: (e.hosts || []).map((h) => h.name).filter(Boolean).join(", "),
    neighborhood:
      ev.location_type === "online"
        ? "Virtual"
        : geo.sublocality || geo.city || "Los Angeles",
    url: "https://lu.ma/" + ev.url,
    source: "luma",
    status,
    guestCount: e.guest_count || 0,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPage(period, cursor) {
  let u = `https://api.lu.ma/calendar/get-items?calendar_api_id=${CAL}&period=${period}&pagination_limit=100`;
  if (cursor) u += `&pagination_cursor=${encodeURIComponent(cursor)}`;
  const headers = {
    accept: "application/json",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
    origin: "https://luma.com",
    referer: "https://luma.com/",
    "x-luma-web-url": "https://luma.com/latw",
  };
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(u, { headers });
    if (r.ok) return r.json();
    if (r.status === 429) {
      await sleep(1200 * (attempt + 1));
      continue;
    }
    throw new Error(`Luma API ${r.status} for ${period}`);
  }
  throw new Error(`Luma API rate-limited for ${period}`);
}

const inWindow = (d) => d >= WIN_START && d <= WIN_END;

async function main() {
  const out = new Map();

  // Future events (from "now" to end of calendar).
  const future = await getPage("future");
  (future.entries || []).forEach((e) => {
    const m = mapEntry(e);
    if (inWindow(m.day)) out.set(m.url, m);
  });

  // Past events are newest-first and span prior years — paginate until we fall
  // out of the 2026 window, then stop.
  let cursor = null;
  for (let guard = 0; guard < 25; guard++) {
    const page = await getPage("past", cursor);
    const ents = page.entries || [];
    ents.forEach((e) => {
      const m = mapEntry(e);
      if (inWindow(m.day)) out.set(m.url, m);
    });
    const lastDay = ents.length
      ? laParts(ents[ents.length - 1].event.start_at).day
      : WIN_START;
    if (!page.has_more || !page.next_cursor || lastDay < WIN_START) break;
    cursor = page.next_cursor;
  }

  const arr = [...out.values()].sort((a, b) =>
    a.day === b.day ? a.time.localeCompare(b.time) : a.day.localeCompare(b.day),
  );
  fs.writeFileSync(OUT, JSON.stringify(arr, null, 0));
  console.log(`Wrote ${OUT} with ${arr.length} Luma events`);
  const byDay = {};
  arr.forEach((e) => (byDay[e.day] = (byDay[e.day] || 0) + 1));
  console.log("By day:", JSON.stringify(byDay));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
