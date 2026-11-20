import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { SkillCategory } from "@/content/types";
import { buildSkillDomainSummaries, type SkillDomainSummary } from "@/lib/skill-domains";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIZE = 300;
const CENTER = SIZE / 2;
const MAX_RADIUS = 98;
const LABEL_RADIUS = 124;
const LEVELS = 4;
const DROPDOWN_GAP = 8;

function polarToCartesian(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function polygonPoints(values: number[]): string {
  const step = 360 / values.length;
  return values
    .map((value, index) => {
      const point = polarToCartesian(index * step, MAX_RADIUS * value);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function wedgePath(index: number, total: number, radius: number): string {
  const step = 360 / total;
  const startAngle = index * step - step / 2;
  const endAngle = index * step + step / 2;
  const start = polarToCartesian(startAngle, radius);
  const end = polarToCartesian(endAngle, radius);

  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`;
}

type SkillsPolarChartProps = {
  skills: SkillCategory[];
  compact?: boolean;
  portalContainer?: HTMLElement | null;
};

function SkillsDomainDropdown({
  domains,
  selectedDomain,
  onSelectDomain,
  open,
  onOpenChange,
  portalContainer,
}: {
  domains: SkillDomainSummary[];
  selectedDomain: SkillDomainSummary;
  onSelectDomain: (domain: SkillDomainSummary) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portalContainer?: HTMLElement | null;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panelMaxHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_GAP;
    const spaceAbove = rect.top - DROPDOWN_GAP;
    const openUpward = spaceBelow < panelMaxHeight && spaceAbove > spaceBelow;

    if (portalContainer && portalContainer !== document.body) {
      const containerRect = portalContainer.getBoundingClientRect();
      setPanelStyle({
        position: "absolute",
        top: openUpward
          ? rect.top - containerRect.top - DROPDOWN_GAP
          : rect.bottom - containerRect.top + DROPDOWN_GAP,
        left: rect.left - containerRect.left,
        width: rect.width,
        transform: openUpward ? "translateY(-100%)" : undefined,
        zIndex: 1,
      });
      return;
    }

    setPanelStyle({
      position: "fixed",
      top: openUpward ? undefined : rect.bottom + DROPDOWN_GAP,
      bottom: openUpward ? window.innerHeight - rect.top + DROPDOWN_GAP : undefined,
      left: rect.left,
      width: rect.width,
      zIndex: 100,
    });
  }, [portalContainer]);

  useEffect(() => {
    if (!open) return;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition, selectedDomain.id]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  const portalTarget =
    portalContainer ?? (typeof document !== "undefined" ? document.body : null);

  const panel =
    open && portalTarget
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-label={`${selectedDomain.label} skills`}
            style={panelStyle}
            className="z-[1] overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            <div className="flex flex-wrap gap-1.5 border-b border-border p-2">
              {domains.map((domain) => {
                const isSelected = selectedDomain.id === domain.id;
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => onSelectDomain(domain)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-primary/30 bg-primary/10 text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                    )}
                    aria-pressed={isSelected}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: domain.color }}
                      aria-hidden="true"
                    />
                    {domain.shortLabel}
                  </button>
                );
              })}
            </div>

            <div className="border-b border-border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{selectedDomain.count} skills</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {Math.round(selectedDomain.score * 100)}%
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${selectedDomain.score * 100}%`,
                    backgroundColor: selectedDomain.color,
                  }}
                />
              </div>
            </div>

            <ul className="max-h-56 space-y-0.5 overflow-y-auto p-2 text-sm leading-relaxed text-foreground/90">
              {selectedDomain.skills.map((skill) => (
                <li
                  key={skill}
                  role="option"
                  aria-selected="true"
                  className="rounded-md px-2 py-1.5 hover:bg-muted/50"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>,
          portalTarget,
        )
      : null;

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="secondary"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => onOpenChange(!open)}
        className="h-auto w-full justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: selectedDomain.color }}
            aria-hidden="true"
          />
          <span className="truncate text-sm font-medium">{selectedDomain.label}</span>
          <span className="shrink-0 text-xs text-muted-foreground">({selectedDomain.count})</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </Button>
      {panel}
    </>
  );
}

export function SkillsPolarChart({
  skills,
  compact = false,
  portalContainer,
}: SkillsPolarChartProps) {
  const domains = useMemo(() => buildSkillDomainSummaries(skills), [skills]);
  const [selectedDomain, setSelectedDomain] = useState<SkillDomainSummary | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (domains.length > 0) {
      setSelectedDomain((current) => current ?? domains[0]);
    }
  }, [domains]);

  function selectDomain(domain: SkillDomainSummary, openDropdown = false) {
    setSelectedDomain(domain);
    if (openDropdown) setDropdownOpen(true);
  }

  return (
    <div className={cn("w-full", compact ? "max-w-[260px]" : "max-w-[300px]")}>
      <div className={cn("mx-auto w-full", compact ? "w-[260px]" : "max-w-[300px]")}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label="Polar chart of skills across Software Development, Infrastructure, Business, UX/UI, and AI"
          className="h-auto w-full"
        >
          {Array.from({ length: LEVELS }, (_, level) => {
            const ringValues = domains.map(() => (level + 1) / LEVELS);
            return (
              <polygon
                key={level}
                points={polygonPoints(ringValues)}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1"
                opacity={0.85}
              />
            );
          })}

          {domains.map((_, index) => {
            const end = polarToCartesian((index * 360) / domains.length, MAX_RADIUS);
            return (
              <line
                key={`axis-${index}`}
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={polygonPoints(domains.map((domain) => domain.score))}
            fill="hsla(221, 83%, 53%, 0.18)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {domains.map((domain, index) => {
            const point = polarToCartesian((index * 360) / domains.length, MAX_RADIUS * domain.score);
            const isSelected = selectedDomain?.id === domain.id;

            return (
              <circle
                key={`point-${domain.id}`}
                cx={point.x}
                cy={point.y}
                r={isSelected ? 6 : 4}
                fill={domain.color}
                stroke="hsl(var(--background))"
                strokeWidth="2"
              />
            );
          })}

          {domains.map((domain, index) => {
            const isSelected = selectedDomain?.id === domain.id;

            return (
              <path
                key={`wedge-${domain.id}`}
                d={wedgePath(index, domains.length, MAX_RADIUS + 14)}
                fill={isSelected ? domain.fill : "transparent"}
                className="cursor-pointer transition-colors"
                onClick={() => selectDomain(domain, true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectDomain(domain, true);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${domain.label}: ${domain.count} skills`}
              />
            );
          })}

          {domains.map((domain, index) => {
            const labelPoint = polarToCartesian((index * 360) / domains.length, LABEL_RADIUS);
            const isSelected = selectedDomain?.id === domain.id;

            return (
              <text
                key={`label-${domain.id}`}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn(
                  "pointer-events-none text-[10px] font-semibold",
                  isSelected ? "fill-foreground" : "fill-muted-foreground",
                )}
              >
                {domain.shortLabel}
              </text>
            );
          })}
        </svg>
      </div>

      {selectedDomain ? (
        <div className="mt-3">
          <SkillsDomainDropdown
            domains={domains}
            selectedDomain={selectedDomain}
            onSelectDomain={(domain) => selectDomain(domain)}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            portalContainer={portalContainer}
          />
        </div>
      ) : null}

      {!compact ? (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Click a segment or open the dropdown to browse skills.
        </p>
      ) : null}
    </div>
  );
}
