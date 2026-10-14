// Muted, desaturated accent per category — a calm cue, not a loud one.
export const CATEGORY_COLORS: Record<string, string> = {
  connors: "#d9b44a",
  deeptech: "#5fb3a3",
  gaming: "#8b84c9",
  health: "#6fae84",
  sports: "#d19a5b",
  crypto: "#c9a94a",
  ai: "#c97b96",
  media: "#cc7f74",
  fundraising: "#6aa8a0",
  devtools: "#6f91c4",
  founders: "#a98fc9",
  social: "#c98f6a",
};

export function catColor(id: string): string {
  return CATEGORY_COLORS[id] ?? "#9790ad";
}
