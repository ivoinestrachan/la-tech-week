export type Period = "morning" | "afternoon" | "evening" | "all";

export interface TWEvent {
  id: number;
  title: string;
  host: string;
  neighborhood: string;
  day: string;
  dayShort: string;
  dayLabel: string;
  time: string;
  minutes: number;
  period: Period;
  category: string;
  tags: string[];
  featured: boolean;
  waitlist: boolean;
  closed: boolean;
  canceled: boolean;
  url: string;
}

export interface CategoryMeta {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
}

export interface DayMeta {
  short: string;
  label: string;
}

export interface TWData {
  generatedAt: string;
  source: string;
  total: number;
  categories: Record<string, CategoryMeta>;
  categoryOrder: string[];
  days: Record<string, DayMeta>;
  dayOrder: string[];
  counts: Record<string, number>;
  events: TWEvent[];
}
