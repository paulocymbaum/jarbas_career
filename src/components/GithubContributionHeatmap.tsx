import { useMemo, useState } from "react";
import type { GithubActivitySnapshot } from "@/content/types";
import {
  contributionLevel,
  flattenWeeks,
  levelColor,
  monthLabelsForWeeks,
  yearLabelsForWeeks,
  type HeatmapCell,
} from "@/lib/github-heatmap";
import { trackGithubNavigation } from "@/lib/analytics";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CELL_SIZE = "0.75rem";

type GithubContributionHeatmapProps = {
  activity: GithubActivitySnapshot;
  className?: string;
  /** Hide the internal summary row when the parent panel already shows it. */
  hideSummary?: boolean;
};

export function GithubContributionHeatmap({
  activity,
  className,
  hideSummary = false,
}: GithubContributionHeatmapProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);
  const cells = useMemo(() => flattenWeeks(activity.weeks), [activity.weeks]);
  const labels = useMemo(() => monthLabelsForWeeks(activity.weeks), [activity.weeks]);
  const years = useMemo(() => yearLabelsForWeeks(activity.weeks), [activity.weeks]);
  const weekCount = activity.weeks.length;

  if (!activity.weeks.length) {
    return (
      <p className="text-sm text-muted-foreground">
        GitHub activity will appear here after the next sync.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {hideSummary ? (
        <p className="text-xs text-muted-foreground">
          {hovered ? (
            <>
              <span className="font-medium text-foreground">{hovered.count}</span>
              contribution
              {hovered.count === 1 ? "" : "s"} on{" "}
              <span className="font-medium text-foreground">
                {new Date(`${hovered.date}T12:00:00Z`).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </>
          ) : (
            "Hover a day for details"
          )}
        </p>
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {activity.totalContributions.toLocaleString()} contributions
              {activity.from && activity.to ? ` · ${activity.from} → ${activity.to}` : null}
              {activity.includesPrivateContributions ? " · includes private repos" : null}
            </p>
            {hovered ? (
              <p className="mt-1 text-xs text-foreground">
                <span className="font-medium">{hovered.count}</span> contribution
                {hovered.count === 1 ? "" : "s"} on{" "}
                <span className="font-medium">
                  {new Date(`${hovered.date}T12:00:00Z`).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Hover a day for details</p>
            )}
          </div>
          <a
            href={`https://github.com/${activity.username}`}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            rel="noopener noreferrer"
            target="_blank"
            data-analytics-id="activity-heatmap-github-profile"
            onClick={(event) =>
              trackGithubNavigation(
                `https://github.com/${activity.username}`,
                "activity_heatmap",
                event,
              )
            }
          >
            @{activity.username}
          </a>
        </div>
      )}

      <div className="overflow-x-auto pb-1">
        <div className="inline-grid min-w-max gap-1">
          {years.length > 0 ? (
            <div
              className="grid min-w-max shrink-0 gap-1"
              style={{
                gridTemplateColumns: `repeat(${weekCount}, ${CELL_SIZE})`,
              }}
            >
              {years.map((year) => (
                <div
                  key={`${year.label}-${year.weekIndex}`}
                  className="text-[10px] font-semibold text-foreground/80"
                  style={{ gridColumnStart: year.weekIndex + 1 }}
                >
                  {year.label}
                </div>
              ))}
            </div>
          ) : null}

          <div
            className="grid min-w-max shrink-0 gap-1"
            style={{
              gridTemplateColumns: `repeat(${weekCount}, ${CELL_SIZE})`,
            }}
          >
            {labels.map((month) => (
              <div
                key={`${month.label}-${month.weekIndex}`}
                className="text-[10px] text-muted-foreground"
                style={{ gridColumnStart: month.weekIndex + 1 }}
              >
                {month.label}
              </div>
            ))}
          </div>

          <div className="flex min-w-max shrink-0 gap-1">
            <div className="grid shrink-0 grid-rows-7 gap-1 pr-1 text-[10px] leading-none text-muted-foreground">
              {WEEKDAY_LABELS.map((label, index) => (
                <span
                  key={label}
                  className={cn("flex h-3 items-center", index % 2 === 0 ? "opacity-100" : "opacity-0")}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="grid min-w-max shrink-0 gap-1"
              style={{
                gridTemplateRows: `repeat(7, ${CELL_SIZE})`,
                gridTemplateColumns: `repeat(${weekCount}, ${CELL_SIZE})`,
              }}
              role="img"
              aria-label={`GitHub contribution heatmap for ${activity.username}`}
            >
              {cells.map((cell) => {
                const level = contributionLevel(cell.count);
                return (
                  <button
                    key={`${cell.weekIndex}-${cell.date}`}
                    type="button"
                    className={cn(
                      "size-3 shrink-0 rounded-sm border border-border/40 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    style={{
                      gridColumn: cell.weekIndex + 1,
                      gridRow: cell.weekday + 1,
                      backgroundColor: levelColor(level, dark),
                    }}
                    aria-label={`${cell.count} contributions on ${cell.date}`}
                    onMouseEnter={() => setHovered(cell)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(cell)}
                    onBlur={() => setHovered(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <span
            key={level}
            className="h-3 w-3 rounded-sm border border-border/40"
            style={{ backgroundColor: levelColor(level, dark) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
