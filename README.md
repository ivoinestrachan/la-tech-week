# LA Tech Week 2026 — Every Event, Sorted

An unofficial, systematized index of **every LA Tech Week 2026 event** (Oct 12–18),
organized into the categories you actually care about — Deep Tech, AI & Agents,
Gaming & XR, Sports & Fitness, Health & Wellness, Crypto, Media, Fundraising, and more.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS**. Fully mobile-responsive.

![781 events across 7 days, 11 categories, 41 neighborhoods](./data/events.json)

## Features

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

1. **Scrape** — events were pulled per-day from `tech-week.com/calendar/la?day=YYYY-MM-DD`
   (the schedule table: time, title, host, neighborhood, status) into `data/events.raw.json`.
2. **Process** — `scripts/process.js` categorizes each event by keyword heuristics
   (title + host), parses times into periods, flags status (featured/closed/waitlist),
   and builds the real apply URL. Regenerate with:

   ```bash
   npm run scrape:process
   ```

Categories and their keyword rules live at the top of `scripts/process.js` — tweak
them there and re-run to recategorize.

## Notes

Not affiliated with a16z or Tech Week. Data is a point-in-time index for convenience;
check the [official site](https://www.tech-week.com/calendar/la) for the source of truth.
