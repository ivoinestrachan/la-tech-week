"use client";

import { useMemo, useState } from "react";
import rawData from "@/data/events.json";
import type { TWData, TWEvent } from "@/lib/types";
import { CategorySwitcher } from "@/components/CategorySwitcher";
import { Toolbar, type Filters } from "@/components/Toolbar";
import { EventCard } from "@/components/EventCard";

const data = rawData as unknown as TWData;

const DEFAULT_FILTERS: Filters = {
  search: "",
  day: "all",
  period: "all",
  neighborhood: "all",
  sort: "day",
  hideClosed: false,
};

export default function Home() {
  const [category, setCategory] = useState("all");
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);
  const setFilters = (f: Partial<Filters>) =>
    setFiltersState((prev) => ({ ...prev, ...f }));

  const neighborhoods = useMemo(() => {
    const set = new Set(data.events.map((e) => e.neighborhood).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, []);

  const dayIndex = useMemo(() => {
    const m: Record<string, number> = {};
    data.dayOrder.forEach((d, i) => (m[d] = i));
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = data.events.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (filters.day !== "all" && e.day !== filters.day) return false;
      if (filters.period !== "all" && e.period !== filters.period) return false;
      if (filters.neighborhood !== "all" && e.neighborhood !== filters.neighborhood)
        return false;
      if (filters.hideClosed && (e.closed || e.canceled)) return false;
      if (q) {
        const hay = (e.title + " " + e.host + " " + e.neighborhood).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a: TWEvent, b: TWEvent) => {
      if (filters.sort === "title") return a.title.localeCompare(b.title);
      if (filters.sort === "featured") {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
      }
      const d = (dayIndex[a.day] ?? 0) - (dayIndex[b.day] ?? 0);
      return d !== 0 ? d : a.minutes - b.minutes;
    });
    return list;
  }, [category, filters, dayIndex]);

  const activeCat = category === "all" ? null : data.categories[category];
  const hasActiveFilters =
    category !== "all" ||
    filters.search !== "" ||
    filters.day !== "all" ||
    filters.period !== "all" ||
    filters.neighborhood !== "all" ||
    filters.hideClosed;

  const resetAll = () => {
    setCategory("all");
    setFiltersState(DEFAULT_FILTERS);
  };

  const heroStats = [
    { n: data.total, l: "events" },
    { n: data.dayOrder.length, l: "days" },
    { n: data.categoryOrder.length, l: "categories" },
    { n: neighborhoods.length, l: "neighborhoods" },
  ];

  return (
    <>
      {/* header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-bg/70 px-4 py-3.5 backdrop-blur-xl sm:px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <span className="bg-sunset bg-clip-text text-[26px] text-transparent">◎</span>
          <div>
            <div className="font-display text-[15px] font-bold tracking-[0.14em]">
              LA TECH WEEK
            </div>
            <div className="text-[11.5px] text-muted">Oct 12–18, 2026 · unofficial index</div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden rounded-full border border-lineStrong px-3 py-[5px] font-display text-[12.5px] text-muted sm:inline">
            {filtered.length} shown
          </span>
          <a
            href="https://www.tech-week.com/calendar/la"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-muted transition-colors hover:text-ink"
          >
            Official ↗
          </a>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-[1180px] px-4 pb-7 pt-14 sm:px-6 sm:pt-20 lg:px-12 lg:pt-24">
        <h1 className="mb-5 font-display text-[clamp(34px,6.4vw,72px)] font-bold leading-[1.02] tracking-[-0.02em]">
          Every LA Tech Week event,
          <br />
          <span className="bg-sunset bg-clip-text text-transparent">finally organized.</span>
        </h1>
        <p className="mb-7 max-w-[620px] text-[clamp(15px,1.8vw,18px)] text-muted">
          <strong className="text-ink">{data.total}</strong> events across 7 days — sorted into the
          sections you actually care about. Pick a lane, filter by day &amp; neighborhood, and build
          your week.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {heroStats.map((s) => (
            <span
              key={s.l}
              className="inline-flex items-baseline gap-1.5 rounded-full border border-line bg-white/[0.04] px-3.5 py-2 text-[13px] text-muted"
            >
              <b className="font-display text-[14px] text-ink">{s.n}</b> {s.l}
            </span>
          ))}
        </div>
      </section>

      {/* category switcher */}
      <section className="mx-auto max-w-[1180px] px-4 pb-2.5 sm:px-6 lg:px-12">
        <h2 className="mb-4 font-display text-[12px] uppercase tracking-[0.22em] text-muted2">
          Browse by category
        </h2>
        <CategorySwitcher
          categories={data.categories}
          order={data.categoryOrder}
          counts={data.counts}
          total={data.total}
          active={category}
          onSelect={setCategory}
        />
      </section>

      {/* sticky toolbar */}
      <div className="sticky top-[61px] z-40">
        <Toolbar
          filters={filters}
          setFilters={setFilters}
          days={data.days}
          dayOrder={data.dayOrder}
          neighborhoods={neighborhoods}
        />
      </div>

      {/* results */}
      <main className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-12">
        <div className="mb-5 flex items-baseline gap-3">
          <h3 className="font-display text-[22px]">
            {activeCat ? `${activeCat.emoji} ${activeCat.label}` : "All events"}
          </h3>
          <span className="text-[14px] text-muted">{filtered.length} events</span>
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="ml-auto rounded-full border border-lineStrong px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:border-ink hover:text-ink"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <div className="mb-3 text-[40px]">🪹</div>
            <p className="mb-4">No events match these filters.</p>
            <button
              onClick={resetAll}
              className="rounded-full border border-lineStrong px-4 py-2 text-[13px] text-muted transition-colors hover:border-ink hover:text-ink"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ev) => (
              <EventCard key={ev.id} ev={ev} category={data.categories[ev.category]} />
            ))}
          </div>
        )}
      </main>

      {/* footer */}
      <footer className="border-t border-line px-4 py-7 text-center text-[12.5px] text-muted2 sm:px-6 lg:px-12">
        <p>
          Built for LA Tech Week 2026 · data indexed from{" "}
          <a
            href="https://www.tech-week.com/calendar/la"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-ink"
          >
            tech-week.com
          </a>
          . Not affiliated with a16z or Tech Week.
        </p>
      </footer>
    </>
  );
}
