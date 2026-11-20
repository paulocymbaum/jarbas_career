import type { GithubActivitySnapshot, GithubContributionDay } from "@/content/types";

export type HeatmapCell = GithubContributionDay & {
  weekIndex: number;
  weekday: number;
};

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export function contributionLevel(count: number): ContributionLevel {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** Cool blue intensity — same family as the site primary. */
export const LEVEL_COLORS: Record<ContributionLevel, string> = {
  0: "#E2E8F0",
  1: "#BFDBFE",
  2: "#60A5FA",
  3: "#2563EB",
  4: "#1E3A8A",
};

/** Operational emerald telemetry — contribution proof stream (dark mode). */
export const LEVEL_COLORS_DARK: Record<ContributionLevel, string> = {
  0: "#161f33",
  1: "#064e3b",
  2: "#047857",
  3: "#10b981",
  4: "#34d399",
};

export const LEVEL_COLORS_BAR_DARK: Record<ContributionLevel, string> = {
  0: "#161f33",
  1: "#064e3b",
  2: "#047857",
  3: "#10b981",
  4: "#34d399",
};

export const LEVEL_COLORS_BAR: Record<ContributionLevel, string> = {
  0: "#E2E8F0",
  1: "#BFDBFE",
  2: "#60A5FA",
  3: "#2563EB",
  4: "#1E3A8A",
};

export function levelColor(level: ContributionLevel, dark: boolean): string {
  return (dark ? LEVEL_COLORS_DARK : LEVEL_COLORS)[level];
}

export function barLevelColor(level: ContributionLevel, dark: boolean): string {
  return (dark ? LEVEL_COLORS_BAR_DARK : LEVEL_COLORS_BAR)[level];
}

export function flattenWeeks(weeks: GithubActivitySnapshot["weeks"]): HeatmapCell[] {
  return weeks.flatMap((week, weekIndex) =>
    week.map((day) => ({
      ...day,
      weekIndex,
      weekday: new Date(`${day.date}T12:00:00Z`).getUTCDay(),
    })),
  );
}

export function recentWeeks(weeks: GithubActivitySnapshot["weeks"], count: number) {
  return weeks.slice(-count);
}

export function contributionHeight(count: number): number {
  const level = contributionLevel(count);
  return 0.08 + level * 0.22;
}

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function monthLabelsForWeeks(
  weeks: GithubActivitySnapshot["weeks"],
): { label: string; weekIndex: number }[] {
  const labels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((day) => day.date);
    if (!firstDay) return;

    const month = new Date(`${firstDay.date}T12:00:00Z`).getUTCMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTH_LABELS[month], weekIndex });
      lastMonth = month;
    }
  });

  return labels;
}

export function yearLabelsForWeeks(
  weeks: GithubActivitySnapshot["weeks"],
): { label: string; weekIndex: number }[] {
  const labels: { label: string; weekIndex: number }[] = [];
  let lastYear = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((day) => day.date);
    if (!firstDay) return;

    const year = new Date(`${firstDay.date}T12:00:00Z`).getUTCFullYear();
    if (year !== lastYear) {
      labels.push({ label: String(year), weekIndex });
      lastYear = year;
    }
  });

  return labels;
}
