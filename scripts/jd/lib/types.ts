// Shared types for the job-application tailoring pipeline (extract → match → gate → score → deliver).

export type JdSource = {
  type: "url" | "file";
  value: string;
};

export type JdKeywordOrigin = "title" | "must-have" | "responsibility" | "other";

export type JdKeyword = {
  /** Canonical term (market dataset keyword or curated extra). */
  term: string;
  /** Importance gate weight: 3 must-have, 2 responsibility, 1 nice-to-have. */
  weight: 1 | 2 | 3;
  /** Case-insensitive alias phrases; word-boundary matched against CV text. */
  aliases: string[];
  origin: JdKeywordOrigin;
};

export type JdExtraKeyword = {
  term: string;
  weight: number;
  /** Optional additional aliases; defaults to the lowercased term. */
  aliases?: string[];
};

export type JdJson = {
  version: 1;
  source: JdSource;
  role: string;
  company: string;
  location: string | null;
  /** Application folder name: "<ROLE> - <COMPANY>" (sanitized). */
  dir: string;
  /** 1–3 sentence synopsis, agent-curated. */
  summary: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave: string[];
  keywords: JdKeyword[];
  /** JD-specific terms outside the market dataset (domain vocab, tools). Merged into the gate. */
  extraKeywords: JdExtraKeyword[];
  /** JD keywords the profile genuinely cannot claim (recorded for honesty; excluded from the gate). */
  gaps?: { term: string; reason: string }[];
};
