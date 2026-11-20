// Heuristic parser: raw job-posting text → structured sections + role/company detection.
// Output is curated by the agent via jd.json before the gate is built.

export type JdSections = {
  requirements: string[];
  responsibilities: string[];
  niceToHave: string[];
  other: string[];
};

export type ParsedJd = {
  role: string;
  company: string;
  location: string | null;
  sections: JdSections;
  text: string;
};

const REQUIREMENTS_HEADING =
  /^(?:requirements|qualifications|must[- ]have(?:s)?|what you'?ll need|what we'?re looking for|about you|who you are|your profile|minimum qualifications|basic qualifications)\b/i;
const RESPONSIBILITIES_HEADING =
  /^(?:responsibilities|what you'?ll do|the role|your responsibilities|duties|key responsibilities|day[- ]to[- ]day|about the role|the opportunity)\b/i;
const NICE_HEADING =
  /^(?:nice[- ]to[- ]have(?:s)?|bonus( points)?|plus(es)?|preferred qualifications|desirable|good[- ]to[- ]have)\b/i;

type BucketId = "requirements" | "responsibilities" | "niceToHave";

function stripHeadingMarkers(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/[\s:：]+$/, "")
    .trim();
}

function classifyHeading(line: string): BucketId | null {
  const heading = stripHeadingMarkers(line);
  if (heading.length === 0 || heading.length > 80) return null;
  // Headings are short label lines — a sentence ending rules them out.
  if (/[.!?]$/.test(heading)) return null;
  if (NICE_HEADING.test(heading)) return "niceToHave";
  if (REQUIREMENTS_HEADING.test(heading)) return "requirements";
  if (RESPONSIBILITIES_HEADING.test(heading)) return "responsibilities";
  return null;
}

function cleanBullet(line: string): string {
  return line
    .replace(/^[-•*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function cleanTitle(value: string): string {
  const cleaned = value
    .replace(/\s*[\u2013\u2014-]\s*(?:remote|hybrid|onsite|on-site|full[- ]time|part[- ]time|contract).*$/i, "")
    .replace(/\s*\((?:.*?)\)\s*$/, "")
    .trim()
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : "Unknown Role";
}

function cleanCompany(value: string): string {
  const cleaned = value
    .replace(/\s*[\u2013\u2014-].*$/, "")
    .replace(/\s*\((?:.*?)\)\s*$/, "")
    .trim()
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : "Unknown Company";
}

function detectRole(lines: string[], override?: string): string {
  if (override?.trim()) return override.trim();
  for (const line of lines.slice(0, 40)) {
    const labeled = /^(?:job\s*title|position|role|title|vaga)\s*[:\-\u2013\u2014]\s*(.+)$/i.exec(line);
    if (labeled) return cleanTitle(labeled[1]);
    const seeking = /^(?:we are|we're)\s+(?:looking for|seeking|hiring)\s+(?:an?\s+)?(.+)$/i.exec(line);
    if (seeking) return cleanTitle(seeking[1]);
  }
  const first = lines.find((line) => line.trim().length > 0);
  return first ? cleanTitle(first) : "Unknown Role";
}

function detectCompany(lines: string[], override?: string): string {
  if (override?.trim()) return override.trim();
  for (const line of lines.slice(0, 60)) {
    const labeled = /^(?:company|employer|organization|empresa)\s*[:\-\u2013\u2014]\s*(.+)$/i.exec(line);
    if (labeled) return cleanCompany(labeled[1]);
    const at = /\bat\s+([A-Z][A-Za-z0-9&.,'\- ]{1,50})(?:\s*[\u2013\u2014|]|\s*$)/.exec(line);
    if (at) return cleanCompany(at[1]);
  }
  return "Unknown Company";
}

function detectLocation(lines: string[]): string | null {
  for (const line of lines.slice(0, 60)) {
    const labeled = /^(?:location|based in|work location|local)\s*[:\-\u2013\u2014]\s*(.+)$/i.exec(line);
    if (labeled) {
      const value = labeled[1].trim().slice(0, 80);
      return value.length > 0 ? value : null;
    }
  }
  return null;
}

export function parseJd(text: string, overrides?: { role?: string; company?: string }): ParsedJd {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trim())
    .filter((line) => line.length > 0);

  const sections: JdSections = {
    requirements: [],
    responsibilities: [],
    niceToHave: [],
    other: [],
  };

  let current: BucketId | "other" | null = null;
  for (const line of lines) {
    const bucket = classifyHeading(line);
    if (bucket) {
      current = bucket;
      continue;
    }
    const target = current ?? "other";
    const cleaned = cleanBullet(line);
    if (cleaned.length > 0) sections[target].push(cleaned);
  }

  return {
    role: detectRole(lines, overrides?.role),
    company: detectCompany(lines, overrides?.company),
    location: detectLocation(lines),
    sections,
    text: lines.join("\n"),
  };
}
