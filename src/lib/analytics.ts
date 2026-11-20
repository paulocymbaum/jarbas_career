type EventData = Record<string, string>;

export type ClickMetadata = {
  element_id: string;
  analytics_id: string;
  element_tag: string;
  element_type: string;
  label: string;
  href: string;
  section_id: string;
};

type AnalyticsMarkedEvent = Event & { __semanticAnalytics?: boolean };

type SyntheticDomEvent = {
  nativeEvent: Event;
  currentTarget: EventTarget | null;
};

type TrackSource =
  | EventTarget
  | Event
  | SyntheticDomEvent
  | null
  | undefined;

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: EventData) => void;
    };
  }
}

const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID?.trim();
const scriptUrl = import.meta.env.VITE_UMAMI_URL?.trim().replace(/\/$/, "");

const pendingEvents: Array<{ event: string; data?: EventData }> = [];
let initStarted = false;
let flushScheduled = false;

const SECTION_ID_PATTERN =
  /^(about|experience|resumes|skills|writing|education|certifications|projects|activity|contact|section-)/;

const CLICKABLE_SELECTOR =
  'a[href], button, [role="button"], [role="menuitem"], [role="tab"], [data-analytics-id]';

const VISIT_STORAGE_KEY = "umami_visit_id";
let eventIndex = 0;

function getVisitId(): string {
  const fallback = () => `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    const existing = window.sessionStorage.getItem(VISIT_STORAGE_KEY);
    if (existing) return existing;
    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : fallback();
    window.sessionStorage.setItem(VISIT_STORAGE_KEY, created);
    return created;
  } catch {
    return fallback();
  }
}

function viewportBucket(): string {
  const width = window.innerWidth;
  if (width >= 1024) return "desktop";
  if (width >= 640) return "tablet";
  return "mobile";
}

/** Visit-level context merged into every event so Umami rows can be stitched
 * into a single navigation journey (visit_id + sequence + environment). */
function baseContext(): EventData {
  eventIndex += 1;
  let theme = "light";
  try {
    theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  } catch {
    /* SSR-safety: defaults to light */
  }
  return {
    visit_id: getVisitId(),
    event_index: String(eventIndex),
    theme,
    viewport: viewportBucket(),
  };
}

export function isAnalyticsEnabled(): boolean {
  if (!import.meta.env.PROD) return false;
  if (!websiteId || !scriptUrl) return false;
  return true;
}

function flushPendingEvents(): void {
  if (!window.umami) return;

  while (pendingEvents.length > 0) {
    const { event, data } = pendingEvents.shift()!;
    window.umami.track(event, data);
  }
}

function scheduleFlushPendingEvents(): void {
  if (window.umami) {
    flushPendingEvents();
    return;
  }

  if (flushScheduled) return;
  flushScheduled = true;

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (window.umami) {
      window.clearInterval(timer);
      flushScheduled = false;
      flushPendingEvents();
    } else if (attempts >= 200) {
      window.clearInterval(timer);
      flushScheduled = false;
    }
  }, 50);
}

function resolveTrackSource(source: TrackSource): {
  element: EventTarget | null | undefined;
  sourceEvent?: Event;
} {
  if (source && typeof source === "object" && "nativeEvent" in source) {
    const synthetic = source as SyntheticDomEvent;
    if (synthetic.nativeEvent instanceof Event) {
      return {
        element: synthetic.currentTarget,
        sourceEvent: synthetic.nativeEvent,
      };
    }
  }

  if (source instanceof Event) {
    return { element: source.currentTarget, sourceEvent: source };
  }

  return { element: source as EventTarget | null | undefined };
}

function markSemanticClick(event: Event): void {
  (event as AnalyticsMarkedEvent).__semanticAnalytics = true;
}

function findSectionId(element: HTMLElement): string {
  let node: HTMLElement | null = element;

  while (node) {
    if (node.id && SECTION_ID_PATTERN.test(node.id)) {
      return node.id;
    }
    node = node.parentElement;
  }

  return "";
}

function normalizeLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}

export function resolveClickMetadata(
  target: EventTarget | null,
): ClickMetadata | null {
  if (!(target instanceof Element)) return null;

  const clickable = target.closest<HTMLElement>(CLICKABLE_SELECTOR);
  if (!clickable) return null;

  if (clickable.closest("[data-analytics-ignore]")) return null;

  const analyticsId = clickable.getAttribute("data-analytics-id") ?? "";
  const labelledBy = clickable.getAttribute("aria-labelledby");
  const labelFromReference = labelledBy
    ? document.getElementById(labelledBy)?.textContent
    : null;

  return {
    element_id: clickable.id,
    analytics_id: analyticsId,
    element_tag: clickable.tagName.toLowerCase(),
    element_type:
      clickable.getAttribute("type") ??
      clickable.getAttribute("role") ??
      (clickable instanceof HTMLAnchorElement ? "link" : "button"),
    label: normalizeLabel(
      clickable.getAttribute("aria-label") ?? labelFromReference ?? clickable.textContent ?? "",
    ),
    href: clickable instanceof HTMLAnchorElement ? clickable.href : "",
    section_id: findSectionId(clickable),
  };
}

function withClickContext(data: EventData, element?: EventTarget | null): EventData {
  if (!(element instanceof Element)) return data;

  const metadata = resolveClickMetadata(element);
  if (!metadata) return data;

  return {
    ...data,
    element_id: metadata.element_id,
    analytics_id: metadata.analytics_id,
    element_tag: metadata.element_tag,
    element_type: metadata.element_type,
    label: metadata.label,
    href: metadata.href,
    section_id: metadata.section_id,
  };
}

function initClickTracking(): void {
  document.addEventListener(
    "click",
    (event) => {
      if ((event as AnalyticsMarkedEvent).__semanticAnalytics) return;

      const metadata = resolveClickMetadata(event.target);
      if (!metadata) return;

      track(
        "element_click",
        {
          element_id: metadata.element_id,
          analytics_id: metadata.analytics_id,
          element_tag: metadata.element_tag,
          element_type: metadata.element_type,
          label: metadata.label,
          href: metadata.href,
          section_id: metadata.section_id,
        },
        undefined,
        { skipContext: true },
      );
    },
    false,
  );
}

export function initAnalytics(): void {
  if (!isAnalyticsEnabled() || initStarted) return;
  initStarted = true;

  initClickTracking();
  initScrollDepthTracking();
  initErrorTracking();
  scheduleFlushPendingEvents();
}

type TrackOptions = {
  skipContext?: boolean;
  sourceEvent?: Event;
};

export function track(
  event: string,
  data?: EventData,
  source?: TrackSource,
  options?: TrackOptions,
): void {
  if (!isAnalyticsEnabled()) return;

  const { element, sourceEvent } = resolveTrackSource(source);
  const clickEvent = options?.sourceEvent ?? sourceEvent;
  if (clickEvent) markSemanticClick(clickEvent);

  const payload = {
    ...baseContext(),
    ...(options?.skipContext ? (data ?? {}) : withClickContext(data ?? {}, element)),
  };

  if (window.umami) {
    window.umami.track(event, payload);
    return;
  }

  pendingEvents.push({ event, data: payload });
  scheduleFlushPendingEvents();
}

export function trackOutbound(
  destination: string,
  url: string,
  source?: TrackSource,
): void {
  track("outbound_click", { destination, url }, source);
}

export function trackArticleOpen(
  title: string,
  url: string,
  source?: TrackSource,
): void {
  track("article_open", { title, url }, source);
}

export function trackGithubNavigation(
  url: string,
  analyticsSource: string,
  source?: TrackSource,
): void {
  track("github_navigation", { url, source: analyticsSource }, source);
}

export const PRAXIS_PROJECT_SLUG = "praxis";

export function trackPraxisProjectClick(
  action: string,
  url: string,
  source?: TrackSource,
): void {
  track("praxis_project_click", { action, url }, source);
}

export function trackPraxisProjectClickIfNeeded(
  projectSlug: string,
  action: string,
  url: string,
  source?: TrackSource,
): void {
  if (projectSlug === PRAXIS_PROJECT_SLUG) {
    trackPraxisProjectClick(action, url, source);
  }
}

export function trackResumeDownload(
  profileSlug: string,
  analyticsSource: string,
  source?: TrackSource,
): void {
  track("resume_download", { profile: profileSlug, source: analyticsSource }, source);
}

export function trackProjectReadmeOpen(projectSlug: string, source?: TrackSource): void {
  track("project_readme_open", { project: projectSlug }, source);
}

export function trackSkillsDrawerOpen(source: string, clickSource?: TrackSource): void {
  track("skills_drawer_open", { source }, clickSource);
}

export function trackProfileDeepLink(profileSlug: string): void {
  track("profile_deep_link", { profile: profileSlug });
}

export function trackSectionView(sectionId: string, order?: number): void {
  track("section_view", {
    section: sectionId,
    order: String(order ?? 0),
  });
}

export function trackSectionEngaged(sectionId: string, seconds: number): void {
  track("section_engaged", { section: sectionId, seconds: String(seconds) });
}

export function trackFilterChange(
  area: string,
  value: string,
  source?: TrackSource,
): void {
  track("filter_change", { area, value }, source);
}

const SCROLL_MILESTONES = [25, 50, 75, 100];

/** Fire-once scroll-depth milestones (25/50/75/100%) — how far visitors read. */
export function initScrollDepthTracking(): void {
  if (!isAnalyticsEnabled()) return;

  const fired = new Set<number>();
  let ticking = false;

  const evaluate = () => {
    ticking = false;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    if (scrollable <= 0) return;
    const progress = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    for (const milestone of SCROLL_MILESTONES) {
      if (progress >= milestone && !fired.has(milestone)) {
        fired.add(milestone);
        track("scroll_depth", { depth: String(milestone) });
      }
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(evaluate);
      }
    },
    { passive: true },
  );
  window.addEventListener("load", evaluate);
}

/** Client-side error capture — failed experiences are invisible otherwise. */
export function initErrorTracking(): void {
  if (!isAnalyticsEnabled()) return;

  window.addEventListener("error", (event) => {
    track("client_error", {
      type: "error",
      message: normalizeLabel(event.message ?? "unknown").slice(0, 200),
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    track("client_error", {
      type: "promise",
      message: normalizeLabel(String(event.reason ?? "unknown")).slice(0, 200),
    });
  });
}

export const professionalProfileCardId = (slug: string) =>
  `card-professional-profile-${slug}`;

export const PROFESSIONAL_PROFILES_SECTION_ID = "section-professional-profiles";
