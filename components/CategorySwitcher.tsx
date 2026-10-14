"use client";

import type { CategoryMeta } from "@/lib/types";
import { catColor } from "@/lib/colors";

export function CategorySwitcher({
  categories,
  order,
  counts,
  total,
  active,
  onSelect,
}: {
  categories: Record<string, CategoryMeta>;
  order: string[];
  counts: Record<string, number>;
  total: number;
  active: string;
  onSelect: (id: string) => void;
}) {
  const items = [
    { id: "all", label: "All Events", emoji: "✦", blurb: "The full LA Tech Week schedule.", count: total },
    ...order.map((id) => ({
      id,
      label: categories[id]?.label ?? id,
      emoji: categories[id]?.emoji ?? "•",
      blurb: categories[id]?.blurb ?? "",
      count: counts[id] ?? 0,
    })),
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((it) => {
        const isActive = active === it.id;
        const color = it.id === "all" ? "#f4f2fa" : catColor(it.id);
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            aria-pressed={isActive}
            className={`group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 md:p-4 ${
              isActive
                ? "border-white/25 bg-white text-bg shadow-glow"
                : "border-line bg-white/[0.03] hover:border-lineStrong hover:bg-white/[0.06]"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[16px] md:text-[17px]"
                style={
                  isActive
                    ? undefined
                    : { background: `color-mix(in srgb, ${color} 16%, transparent)` }
                }
              >
                {it.emoji}
              </span>
              <span
                className={`font-display text-[13px] font-semibold ${
                  isActive ? "text-bg/60" : "text-muted"
                }`}
              >
                {it.count}
              </span>
            </div>
            <div className="mb-1 font-display text-[15px] font-semibold md:text-[16px]">
              {it.label}
            </div>
            <div
              className={`hidden text-[12px] leading-snug sm:block ${
                isActive ? "text-bg/60" : "text-muted"
              }`}
            >
              {it.blurb}
            </div>
          </button>
        );
      })}
    </div>
  );
}
