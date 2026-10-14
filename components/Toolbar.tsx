"use client";

import type { DayMeta } from "@/lib/types";

export interface Filters {
  search: string;
  day: string; // "all" | date
  period: string; // "all" | morning | afternoon | evening
  neighborhood: string; // "all" | name
  sort: string; // day | title | best
  hideClosed: boolean;
  onlyBest: boolean;
}

const PERIODS = [
  { id: "all", label: "Any time" },
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

export function Toolbar({
  filters,
  setFilters,
  days,
  dayOrder,
  neighborhoods,
}: {
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  days: Record<string, DayMeta>;
  dayOrder: string[];
  neighborhoods: string[];
}) {
  const dayChips = [
    { id: "all", label: "All days" },
    ...dayOrder.map((d) => ({ id: d, label: days[d]?.label ?? d })),
  ];

  return (
    <div className="relative mx-auto mt-6 max-w-[1180px] px-4 py-3.5 sm:px-6 lg:px-12">
      <div className="absolute inset-0 -z-10 border-y border-line bg-bg/80 backdrop-blur-xl" />

      {/* search */}
      <div className="relative mb-3">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-muted2">
          ⌕
        </span>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Search events, hosts, topics…"
          className="w-full rounded-xl border border-lineStrong bg-bg2 py-3 pl-11 pr-4 text-[15px] outline-none transition-colors placeholder:text-muted2 focus:border-white/40"
        />
      </div>

      {/* day chips — horizontal scroll on mobile */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {dayChips.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilters({ day: c.id })}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-[7px] text-[13px] transition-all ${
              filters.day === c.id
                ? "border-ink bg-ink font-semibold text-[#14121b]"
                : "border-line bg-white/[0.04] text-muted hover:border-lineStrong hover:text-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* period + selects + toggle */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex overflow-hidden rounded-xl border border-line">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilters({ period: p.id })}
              className={`px-3 py-[7px] text-[13px] transition-colors ${
                filters.period === p.id
                  ? "bg-white/90 font-semibold text-bg"
                  : "text-muted hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <select
          value={filters.neighborhood}
          onChange={(e) => setFilters({ neighborhood: e.target.value })}
          className="select-arrow cursor-pointer rounded-xl border border-line bg-bg2 py-2 pl-3 pr-8 text-[13px] text-ink"
        >
          <option value="all">All neighborhoods</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value })}
          className="select-arrow cursor-pointer rounded-xl border border-line bg-bg2 py-2 pl-3 pr-8 text-[13px] text-ink"
        >
          <option value="day">Sort: day &amp; time</option>
          <option value="best">Sort: top rated</option>
          <option value="title">Sort: A → Z</option>
        </select>

        <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-muted">
          <input
            type="checkbox"
            checked={filters.hideClosed}
            onChange={(e) => setFilters({ hideClosed: e.target.checked })}
            className="h-[15px] w-[15px] accent-white"
          />
          <span>Hide closed</span>
        </label>
      </div>
    </div>
  );
}
