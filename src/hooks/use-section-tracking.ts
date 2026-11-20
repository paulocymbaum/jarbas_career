import { useEffect } from "react";
import { trackSectionEngaged, trackSectionView } from "@/lib/analytics";

const SECTION_IDS = [
  "resumes",
  "section-professional-profiles",
  "experience",
  "skills",
  "writing",
  "education",
  "certifications",
  "projects",
  "activity",
  "contact",
] as const;

export function useSectionTracking(): void {
  useEffect(() => {
    const seen = new Set<string>();
    const tracked = new Set<string>();
    const dwellStart = new Map<string, number>();
    let viewOrder = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        for (const entry of entries) {
          const sectionId = entry.target.id;
          if (!sectionId) continue;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            if (!dwellStart.has(sectionId)) dwellStart.set(sectionId, now);
            if (!seen.has(sectionId)) {
              seen.add(sectionId);
              viewOrder += 1;
              trackSectionView(sectionId, viewOrder);
            }
          } else if (dwellStart.has(sectionId)) {
            const dwellMs = now - (dwellStart.get(sectionId) ?? now);
            dwellStart.delete(sectionId);
            if (dwellMs >= 5000) {
              trackSectionEngaged(sectionId, Math.round(dwellMs / 1000));
            }
          }
        }
      },
      { threshold: [0.25, 0.5] },
    );

    const observeMissing = () => {
      for (const id of SECTION_IDS) {
        if (tracked.has(id)) continue;

        const element = document.getElementById(id);
        if (element) {
          tracked.add(id);
          observer.observe(element);
        }
      }
    };

    observeMissing();

    // Lazy-mounted sections (React.lazy) attach after hydration — keep watching
    // the DOM so their section_view analytics and anchors stay reliable.
    const mutation = new MutationObserver(observeMissing);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);
}
