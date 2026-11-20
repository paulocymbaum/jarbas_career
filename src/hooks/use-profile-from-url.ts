import { useEffect, useState } from "react";
import { trackProfileDeepLink, professionalProfileCardId } from "@/lib/analytics";

export function useProfileFromUrl() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("profile");
    setActiveSlug(slug);

    if (slug) {
      trackProfileDeepLink(slug);
      const target = document.getElementById(professionalProfileCardId(slug));
      target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  return activeSlug;
}
