// Parses tailored CV markdown into placement-scored segments.
// Segment weights mirror scripts/lib/scoring/ats.ts (headline ×3, summary/skills ×2, body ×1).

export type CvSegmentId =
  | "headline"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "credentials";

export const CV_SEGMENT_WEIGHTS: Record<CvSegmentId, number> = {
  headline: 3,
  summary: 2,
  skills: 2,
  experience: 1,
  projects: 1,
  credentials: 1,
};

export const CV_SECTION_LABELS: Record<CvSegmentId, string> = {
  headline: "Headline",
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  credentials: "Education & Certifications",
};

const SECTION_ALIASES: { id: CvSegmentId; pattern: RegExp }[] = [
  { id: "summary", pattern: /^(summary|professional summary|profile|about)\b/i },
  { id: "skills", pattern: /^(technical skills|core skills|skills)\b/i },
  {
    id: "experience",
    pattern: /^(work experience|professional experience|experience|employment)\b/i,
  },
  { id: "projects", pattern: /^(selected projects|key projects|projects)\b/i },
  {
    id: "credentials",
    pattern:
      /^(education(\s*(&|and)\s*)?certifications?|education|certifications?|licenses(\s*(&|and)\s*)?certifications?|credentials)\b/i,
  },
];

export type CvSegment = { id: CvSegmentId; weight: number; text: string };

export type ParsedCv = {
  title: string;
  /** Non-empty segments in fixed order. */
  segments: CvSegment[];
  /** All H2 headings found, in order (diagnostics for missing/unknown sections). */
  headings: string[];
  wordCount: number;
};

function mapSection(label: string): CvSegmentId | null {
  for (const alias of SECTION_ALIASES) {
    if (alias.pattern.test(label)) return alias.id;
  }
  return null;
}

function cleanContentLine(line: string): string {
  return line
    .replace(/^[-*+]\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

export function parseCvMarkdown(markdown: string): ParsedCv {
  const buckets = new Map<CvSegmentId, string[]>();
  const headings: string[] = [];
  let current: CvSegmentId | null = null;
  let title = "";

  const push = (id: CvSegmentId, line: string): void => {
    const bucket = buckets.get(id);
    if (bucket) bucket.push(line);
    else buckets.set(id, [line]);
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) continue;

    if (/^#\s+/.test(line)) {
      title = line.replace(/^#\s+/, "").trim();
      current = "headline";
      push("headline", title);
      continue;
    }

    if (/^##\s+/.test(line)) {
      const label = line.replace(/^##\s+/, "").trim();
      headings.push(label);
      current = mapSection(label);
      continue;
    }

    // H3+ lines (### role headers) are content of the enclosing section.
    if (current) {
      push(current, cleanContentLine(line.replace(/^#{3,}\s+/, "")));
    }
  }

  const segments: CvSegment[] = [];
  let wordCount = 0;
  for (const id of Object.keys(CV_SEGMENT_WEIGHTS) as CvSegmentId[]) {
    const bucket = buckets.get(id);
    if (!bucket || bucket.length === 0) continue;
    const text = bucket.join("\n");
    wordCount += text.split(/\s+/).filter(Boolean).length;
    segments.push({ id, weight: CV_SEGMENT_WEIGHTS[id], text });
  }

  return { title, segments, headings, wordCount };
}
