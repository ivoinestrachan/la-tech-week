// Processes scraped raw events into a clean, categorized dataset for the site.
// Run: node scripts/process.js
const fs = require("fs");
const path = require("path");

const RAW = path.join(__dirname, "..", "data", "events.raw.json");
const OUT = path.join(__dirname, "..", "data", "events.json");

const raw = JSON.parse(fs.readFileSync(RAW, "utf8"));

// --- Category definitions -------------------------------------------------
// Order matters: the first matching category (by keyword hit) becomes the
// event's primary section. All matches are kept as tags for filtering.
const CATEGORIES = [
  {
    id: "deeptech",
    label: "Deep Tech",
    emoji: "\u{1F6F0}️",
    blurb: "Aerospace, defense, robotics, hardware, space, energy & frontier tech.",
    keywords: [
      "aerospace", "defense", "defence", "robot", "robotics", "hardware", "space",
      "satellite", "rocket", "drone", "quantum", "nuclear", "energy", "fusion",
      "manufactur", "materials", "deep tech", "deep-tech", "deeptech", "semiconductor",
      "chips", "autonom", "biotech", "bio tech", "nanotech", "fathomwerx", "defense tech",
      "physical", "atoms", "infra", "climate", "battery", "spacex", "vast", "arc ",
      "el segundo", "gundo",
    ],
  },
  {
    id: "gaming",
    label: "Gaming & XR",
    emoji: "\u{1F3AE}",
    blurb: "Gaming, esports, AR/VR, spatial computing & immersive worlds.",
    keywords: [
      "gaming", "game ", "games", "esport", "ar/vr", "ar / vr", "vr ", "augmented",
      "virtual reality", "spatial", "metaverse", "xr ", "immersive", "playstation",
      "unity", "unreal", "arcade", "twitch",
    ],
  },
  {
    id: "health",
    label: "Health & Wellness",
    emoji: "\u{1FA7A}",
    blurb: "Healthtech, biotech, longevity, mental health & wellness.",
    keywords: [
      "health", "wellness", "longevity", "medical", "medicine", "biotech", "bio ",
      "life sciences", "mental", "therapy", "mindful", "meditation", "nutrition",
      "fem tech", "femtech", "fertility", "clinic", "patient", "wellbeing", "recovery",
      "sauna", "breathwork", "rejuvenate",
    ],
  },
  {
    id: "sports",
    label: "Sports & Fitness",
    emoji: "\u{1F3C3}",
    blurb: "Run clubs, workouts, pickup games, surf, yoga & active meetups.",
    keywords: [
      "soccer", "fútbol", "futbol", "football", "run ", "run&", "5k", "10k",
      "marathon", "workout", "fitness", "lifting", "gym", "yoga", "pilates", "hiit",
      "pickleball", "tennis", "basketball", "golf", "surf", "climb", "bouldering",
      "hike", "walk", "ride", "cycling", "bike", "paddle", "volleyball", "sports",
      "athlet", "pump", "sweat", "beachside",
    ],
  },
  {
    id: "crypto",
    label: "Crypto & Web3",
    emoji: "\u{1FA99}",
    blurb: "Blockchain, DeFi, stablecoins, onchain & web3 builders.",
    keywords: [
      "crypto", "web3", "web 3", "blockchain", "defi", "onchain", "on-chain",
      "stablecoin", "token", "ethereum", "solana", "bitcoin", "nft", "dao ",
      "wallet", "zk ", "zero knowledge",
    ],
  },
  {
    id: "ai",
    label: "AI & Agents",
    emoji: "\u{1F916}",
    blurb: "LLMs, agents, applied AI, ML infra & the frontier model crowd.",
    keywords: [
      "ai ", " ai", "a.i", "agent", "agentic", "llm", "gpt", "genai", "gen ai",
      "generative", "machine learning", "ml ", "model", "claude", "anthropic",
      "openai", "inference", "neural", "copilot", "prompt", "mcp", "rag ",
      "intelligence", "automation",
    ],
  },
  {
    id: "media",
    label: "Media & Creators",
    emoji: "\u{1F3AC}",
    blurb: "Creators, content, film, music, entertainment & culture.",
    keywords: [
      "creator", "content", "media", "film", "music", "entertainment", "hollywood",
      "studio", "video", "podcast", "influencer", "brand", "marketing", "social media",
      "culture", "art ", "design", "fashion", "beauty", "storytelling",
    ],
  },
  {
    id: "fundraising",
    label: "Fundraising & VC",
    emoji: "\u{1F4B0}",
    blurb: "Investors, VCs, demo days, pitch nights & capital.",
    keywords: [
      "investor", "investing", "vc ", "venture", "fundraising", "fund ", "capital",
      "demo day", "pitch", "angel", "lp ", "limited partner", "seed", "series a",
      "raise", "cap table", "term sheet", "family office", "private equity", "deal",
    ],
  },
  {
    id: "devtools",
    label: "Developer & Infra",
    emoji: "\u{1F6E0}️",
    blurb: "Developer tools, cloud, data, APIs & engineering.",
    keywords: [
      "developer", "devtools", "dev tools", "engineer", "api ", "cloud", "data ",
      "database", "infrastructure", "devops", "open source", "open-source", "coding",
      "codelab", "hackathon", "sdk", "platform engineering", "backend", "kubernetes",
    ],
  },
  {
    id: "founders",
    label: "Founders & Startups",
    emoji: "\u{1F680}",
    blurb: "Founder meetups, startup building, growth & operators.",
    keywords: [
      "founder", "startup", "start-up", "builder", "operator", "ceo", "solopreneur",
      "entrepreneur", "scaling", "growth", "go-to-market", "gtm", "bootstrap",
      "early stage", "b2b", "saas", "product",
    ],
  },
];

// Catch-all for social events that don't fit the above.
const SOCIAL = {
  id: "social",
  label: "Social & Networking",
  emoji: "\u{1F37B}",
  blurb: "Happy hours, mixers, dinners, parties & pure networking.",
};

const SOCIAL_HINTS = [
  "happy hour", "mixer", "social", "party", "dinner", "brunch", "lunch", "breakfast",
  "networking", "cocktail", "drinks", "coffee", "salon", "meetup", "mingle", "bonfire",
  "rooftop", "afterparty", "after party", "after-party", "gala", "celebration", "bash",
];

// Connor's hand-picked events — curated from Partiful, outside the tech-week table.
// These always live in their own "Connor's Events" section.
const CONNORS_META = {
  id: "connors",
  label: "Connor's Events",
  emoji: "⭐",
  blurb: "A hand-picked shortlist worth clearing your calendar for.",
};

const CONNORS_EVENTS = [
  {
    title: "surprise it's a speedrun pop up @ #LATechWeek",
    host: "a16z Speedrun",
    day: "2026-10-14",
    time: "3:00pm",
    neighborhood: "Santa Monica",
    url: "https://partiful.com/e/vQY9ZVxLVC4X963cyZPA?c=tVeqsKLg",
    featured: true,
  },
  {
    title: "Founder Happy Hour with ElevenLabs, Koah Labs, Rho, Cake, and Verci",
    host: "ElevenLabs, Koah Labs, Rho, Cake, Verci",
    day: "2026-10-14",
    time: "6:00pm",
    neighborhood: "Venice",
    url: "https://partiful.com/e/kSsgfoB5zqzABdPJFW3C?c=pc5qMTdv",
    featured: true,
  },
  {
    title: "Defense/Deep-Tech After Party",
    host: "Wells Fargo, Eagle Law, Greenberg Traurig, Fulcrum Venture Group, Multiball Capital",
    day: "2026-10-14",
    time: "8:00pm",
    neighborhood: "Hollywood",
    url: "https://partiful.com/e/bzzSRmMWxNc87qnJwuYu?c=Yr--Mau0",
    closed: true, // 0/335 spots left
  },
];

function norm(s) {
  return (" " + (s || "").toLowerCase() + " ").replace(/[–—]/g, " ");
}

function categorize(ev) {
  const hay = norm(ev.title + " " + ev.host);
  const tags = [];
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => hay.includes(k))) tags.push(cat.id);
  }
  const isSocial = SOCIAL_HINTS.some((k) => hay.includes(k));
  let primary = tags[0];
  if (!primary) primary = isSocial ? "social" : "founders";
  if (isSocial && !tags.includes("social")) tags.push("social");
  return { primary, tags };
}

// --- Time parsing ---------------------------------------------------------
function parseTime(t) {
  // formats like "6:00am", "12:30pm", "10:45 AM"
  const m = (t || "").trim().toLowerCase().match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
  if (!m) return { minutes: 9999, period: "all", label: t || "" };
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3];
  if (ap === "pm" && h !== 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  const minutes = h * 60 + min;
  let period = "evening";
  if (minutes < 11 * 60) period = "morning";
  else if (minutes < 16 * 60) period = "afternoon";
  const label = `${((h % 12) || 12)}:${m[2]} ${ap.toUpperCase()}`;
  return { minutes, period, label };
}

const DAY_LABELS = {
  "2026-10-12": { short: "Mon", label: "Mon, Oct 12" },
  "2026-10-13": { short: "Tue", label: "Tue, Oct 13" },
  "2026-10-14": { short: "Wed", label: "Wed, Oct 14" },
  "2026-10-15": { short: "Thu", label: "Thu, Oct 15" },
  "2026-10-16": { short: "Fri", label: "Fri, Oct 16" },
  "2026-10-17": { short: "Sat", label: "Sat, Oct 17" },
  "2026-10-18": { short: "Sun", label: "Sun, Oct 18" },
};

// --- "Best events" ranking algorithm -------------------------------------
// Every event gets a transparent 0–100 quality score from a weighted rubric.
// Events scoring at/above BEST_THRESHOLD are promoted to the "Best" tier.
const BEST_THRESHOLD = 50;

// Marquee hosts: top funds, big tech, and notable operators. Lowercased
// substrings matched against the host string.
const NOTABLE_HOSTS = [
  "a16z", "andreessen", "speedrun", "sequoia", "lightspeed", "accel",
  "general catalyst", "khosla", "founders fund", "greylock", "benchmark",
  "bessemer", "menlo", "first round", "nea", "index ventures", "craft",
  "upfront", "mucker", "8vc", "initialized", "y combinator", "ycombinator",
  "techstars", "plug and play", "gold house", "gradient", "gv",
  "google", "adobe", "anthropic", "openai", "amazon", "aws", "microsoft",
  "nvidia", "meta", "apple", "stripe", "ramp", "brex", "visa", "mastercard",
  "hsbc", "wells fargo", "jpmorgan", "morgan stanley", "goldman",
  "elevenlabs", "vercel", "notion", "figma", "databricks", "scale ai",
  "mathworks", "sphere", "tinder", "pwc", "kpmg", "deloitte", "ey",
  "fenwick", "cooley", "wilson sonsini", "greenberg traurig", "vast",
];

// Title phrases that signal a flagship / high-signal event.
const TITLE_SIGNALS = [
  { kw: ["official", "kickoff", "flagship"], pts: 12 },
  { kw: ["keynote", "summit", "mainstage", "main stage"], pts: 9 },
  { kw: ["exclusive", "invite only", "invite-only", "vip", "private", "curated"], pts: 8 },
  { kw: ["demo day", "pitch competition", "shark tank"], pts: 6 },
  { kw: ["a16z", "speedrun"], pts: 8 },
];

function computeQuality(ev) {
  const reasons = [];
  if (ev.canceled) return { score: 0, best: false, reasons: ["Canceled"] };

  let score = 18; // baseline for any listed event
  const hostL = (ev.host || "").toLowerCase();
  const titleL = (ev.title || "").toLowerCase();

  if (ev.category === "connors") {
    score += 46;
    reasons.push("Hand-picked");
  }
  if (ev.featured) {
    score += 40;
    reasons.push("Featured by Tech Week");
  }

  const notable = NOTABLE_HOSTS.filter((h) => hostL.includes(h));
  if (notable.length) {
    score += Math.min(30, 18 + (notable.length - 1) * 4);
    reasons.push("Notable host");
  }

  // Demand signal: a closed / sold-out event filled up; waitlist = high interest.
  if (ev.closed) {
    score += 14;
    reasons.push("Sold out / high demand");
  } else if (ev.waitlist) {
    score += 9;
    reasons.push("Waitlisted");
  }

  // Collaborations (multiple co-hosts) tend to be bigger productions.
  const hostCount = hostL ? hostL.split(",").filter((s) => s.trim()).length : 0;
  if (hostCount >= 2) {
    score += Math.min(9, (hostCount - 1) * 3);
    if (hostCount >= 3) reasons.push("Multi-host collab");
  }

  // Title signals (capped so a keyword-stuffed title can't dominate).
  let titlePts = 0;
  for (const s of TITLE_SIGNALS) {
    if (s.kw.some((k) => titleL.includes(k))) titlePts += s.pts;
  }
  if (titlePts > 0) {
    score += Math.min(18, titlePts);
    reasons.push("Flagship-style event");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, best: score >= BEST_THRESHOLD, reasons };
}

const events = raw.map((ev, i) => {
  const { primary, tags } = categorize(ev);
  const t = parseTime(ev.time);
  const statusList = (ev.status || []).map((s) => s.toLowerCase());
  const closed = statusList.some((s) => /closed|sold|cancel/.test(s));
  const featured = statusList.includes("featured");
  const waitlist = statusList.includes("waitlist");
  const canceled = statusList.some((s) => /cancel/.test(s));
  const base = {
    id: i,
    title: ev.title,
    host: ev.host,
    neighborhood: ev.neighborhood || "Other",
    day: ev.day,
    dayShort: DAY_LABELS[ev.day]?.short || ev.day,
    dayLabel: DAY_LABELS[ev.day]?.label || ev.day,
    time: t.label,
    minutes: t.minutes,
    period: t.period,
    category: primary,
    tags: [...new Set(tags)],
    featured,
    waitlist,
    closed,
    canceled,
    url: "https://www.tech-week.com/go/event/" + ev.href,
  };
  const q = computeQuality(base);
  return { ...base, score: q.score, best: q.best, bestReasons: q.reasons };
});

// Build Connor's curated events and prepend them to the dataset.
const connorsEvents = CONNORS_EVENTS.map((c, i) => {
  const t = parseTime(c.time);
  const d = DAY_LABELS[c.day] || { short: c.day, label: c.day };
  return {
    id: 90000 + i,
    title: c.title,
    host: c.host,
    neighborhood: c.neighborhood || "Los Angeles",
    day: c.day,
    dayShort: d.short,
    dayLabel: d.label,
    time: t.label,
    minutes: t.minutes,
    period: t.period,
    category: "connors",
    tags: ["connors"],
    featured: !!c.featured,
    waitlist: !!c.waitlist,
    closed: !!c.closed,
    canceled: false,
    url: c.url,
  };
});
connorsEvents.forEach((e) => {
  const q = computeQuality(e);
  e.score = q.score;
  e.best = q.best;
  e.bestReasons = q.reasons;
});
events.push(...connorsEvents);

// sort by day then time
const DAY_ORDER = Object.keys(DAY_LABELS);
events.sort((a, b) => {
  const d = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
  return d !== 0 ? d : a.minutes - b.minutes;
});

const catMeta = {};
[CONNORS_META, ...CATEGORIES, SOCIAL].forEach((c) => {
  catMeta[c.id] = { id: c.id, label: c.label, emoji: c.emoji, blurb: c.blurb };
});

const counts = {};
events.forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1; });

const bestCount = events.filter((e) => e.best).length;

const out = {
  generatedAt: "2026-10-14",
  source: "tech-week.com/calendar/la",
  total: events.length,
  bestCount,
  categories: catMeta,
  categoryOrder: [CONNORS_META.id, ...CATEGORIES.map((c) => c.id), SOCIAL.id],
  days: DAY_LABELS,
  dayOrder: DAY_ORDER,
  counts,
  events,
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 0));
console.log("Wrote", OUT, "with", events.length, "events");
console.log("Category counts:", JSON.stringify(counts, null, 2));
console.log(`Best tier: ${bestCount}/${events.length} (${Math.round((bestCount / events.length) * 100)}%)`);
const buckets = { "0-19": 0, "20-39": 0, "40-57": 0, "58-74": 0, "75-100": 0 };
events.forEach((e) => {
  if (e.score < 20) buckets["0-19"]++;
  else if (e.score < 40) buckets["20-39"]++;
  else if (e.score < 58) buckets["40-57"]++;
  else if (e.score < 75) buckets["58-74"]++;
  else buckets["75-100"]++;
});
console.log("Score distribution:", JSON.stringify(buckets));
console.log("Top 10:", events.slice().sort((a, b) => b.score - a.score).slice(0, 10).map((e) => `${e.score} ${e.title.slice(0, 42)}`));
