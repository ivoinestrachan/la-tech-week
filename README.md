# LA Tech Week 2026 — Every Event, Sorted

An unofficial, systematized index of **every LA Tech Week 2026 event** (Oct 12–18),
organized into the categories you actually care about — Deep Tech, AI & Agents,
Gaming & XR, Sports & Fitness, Health & Wellness, Crypto, Media, Fundraising, and more.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS**. Fully mobile-responsive.

![781 events across 7 days, 11 categories, 41 neighborhoods](./data/events.json)

## Features

- **Live & time-aware** — a ticking clock, past days auto-hidden, "● LIVE NOW" / "SOON" /
  "ended" status on every card, and a "N happening now" counter. Toggle "Show past" to see
  the full week. (`lib/time.ts`)
- **Browse by category** — tap any section card to filter the whole schedule to that lane.
- **Filters** — search, day (Mon–Sun), time of day (morning/afternoon/evening),
  neighborhood, and a "hide closed" toggle.
- **Sorting** — by day & time, A→Z, or featured-first.
- **781 real events** indexed from the official schedule, each linking back to its
  apply/RSVP page.
- **Mobile-first** — horizontal-scroll day chips, stacked controls, single-column cards.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## Project structure

```
app/
  layout.tsx            # fonts, metadata, ambient glow background
  page.tsx              # client page: state, filtering, layout
  globals.css           # Tailwind + base styles
components/
  CategorySwitcher.tsx  # the category section cards
  Toolbar.tsx           # search + day/period/neighborhood/sort filters
  EventCard.tsx         # a single event card
lib/
  types.ts              # TWEvent / TWData types
  colors.ts             # per-category accent colors
data/
  events.json           # processed, categorized dataset (consumed by the app)
  events.raw.json       # raw scraped rows
scripts/
  process.js            # categorizes + enriches raw events -> events.json
```

## Data pipeline

Two sources are merged (deduped by title), each event tagged with its `source`:

1. **Scrape Tech Week** — events pulled per-day from `tech-week.com/calendar/la?day=YYYY-MM-DD`
   (the schedule table: time, title, host, neighborhood, status) into `data/events.raw.json`.
2. **Fetch Luma** — `scripts/fetch-luma.js` hits the public Luma calendar API for
   `luma.com/latw`, windows to Oct 12–18 2026 (the calendar spans multiple years),
   converts times to LA local, and writes `data/luma.raw.json`. Luma also gives RSVP
   guest counts, which feed the ranking as a demand signal. Run: `node scripts/fetch-luma.js`.
3. **Process** — `scripts/process.js` merges both, categorizes each event by keyword heuristics
   (title + host), parses times into periods, flags status (featured/closed/waitlist),
   and builds the real apply URL. Regenerate with:

   ```bash
   npm run scrape:process
   ```

Categories and their keyword rules live at the top of `scripts/process.js` — tweak
them there and re-run to recategorize.

## "Best Events" ranking algorithm

Alongside categories, every event gets a transparent **0–100 quality score**
(`scripts/process.js → computeQuality`). Events at/above the threshold
(`BEST_THRESHOLD`, currently 50) are promoted to the **Best** tier, toggled via the
`★ Best` control and surfaced by the "Top rated" sort.

The score is a weighted rubric over the signals we actually have:

| Signal | Weight | Why |
|---|---|---|
| Baseline | +18 | Every listed event starts here |
| Hand-picked (Connor's) | +46 | Human curation is the strongest signal |
| Featured by Tech Week | +40 | Editorially highlighted by the organizers |
| Notable host | +18 (+4 each extra, cap 30) | Top funds / big tech / known operators (`NOTABLE_HOSTS`) |
| Sold out / closed | +14 | Demand proxy — it filled up |
| Waitlisted | +9 | High interest |
| Multi-host collab | +3 each (cap 9) | Bigger co-produced events |
| Flagship title cues | up to +18 | "official", "keynote", "summit", "invite only", "demo day"… |

Each best event stores its `bestReasons` (shown on hover of the ★ Best badge), so the
ranking is explainable rather than a black box. The threshold and all weights are
constants at the top of the file — raise/lower `BEST_THRESHOLD` to make the tier
stricter or more inclusive, then `npm run scrape:process`.

## Notes

Not affiliated with a16z or Tech Week. Data is a point-in-time index for convenience;
check the [official site](https://www.tech-week.com/calendar/la) for the source of truth.
