import type { TWEvent, CategoryMeta } from "@/lib/types";
import { catColor } from "@/lib/colors";

export function EventCard({
  ev,
  category,
}: {
  ev: TWEvent;
  category?: CategoryMeta;
}) {
  const color = catColor(ev.category);
  const statusBadge = ev.featured
    ? { label: "Featured", cls: "bg-orange/15 text-orange" }
    : ev.closed || ev.canceled
      ? { label: ev.canceled ? "Canceled" : "Closed", cls: "bg-coral/15 text-coral" }
      : ev.waitlist
        ? { label: "Waitlist", cls: "bg-cyan/15 text-cyan" }
        : null;

  return (
    <a
      href={ev.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ["--cat" as string]: color }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.04] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-lineStrong hover:bg-white/[0.07] ${
        ev.closed || ev.canceled ? "opacity-60" : ""
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 w-[2px] opacity-55"
        style={{ background: color }}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-white/[0.07] px-2 py-1 font-display text-[11.5px] font-semibold tracking-wide">
          {ev.dayShort} · {ev.time}
        </span>
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
        <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted2">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {ev.neighborhood}
        </span>
      </div>
    </a>
  );
}
