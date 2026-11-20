import { useMemo, useState } from "react";
import { ArrowLeft, Briefcase, FileText, Linkedin } from "lucide-react";
import { recruitmentContent } from "@/content/recruitment";
import { siteContent } from "@/content/site";
import { RecruitmentSectionPanel } from "@/components/recruitment/RecruitmentSectionPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLATFORM_TABS = [
  { id: "upwork", label: "Upwork", icon: Briefcase },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "general", label: "General", icon: FileText },
] as const;

type PlatformTab = (typeof PLATFORM_TABS)[number]["id"];

export function RecruitmentPage() {
  const [activeSlug, setActiveSlug] = useState(recruitmentContent.packs[0]?.slug ?? "");
  const [activePlatform, setActivePlatform] = useState<PlatformTab>("upwork");

  const activePack = useMemo(
    () => recruitmentContent.packs.find((pack) => pack.slug === activeSlug),
    [activeSlug],
  );

  const activeSections = useMemo(() => {
    if (!activePack) return [];
    if (activePlatform === "upwork") return activePack.upwork;
    if (activePlatform === "linkedin") return activePack.linkedin;
    return activePack.general;
  }, [activePack, activePlatform]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">Local only</p>
            <h1 className="text-xl font-bold sm:text-2xl">Recruitment toolkit</h1>
            <p className="text-sm text-muted-foreground">
              Copy-ready onboarding text per profile — not included in production builds.
            </p>
          </div>
          <Button asChild variant="secondary">
            <a href="#top">
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </a>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground/90">
          Profile data from <code className="rounded bg-muted px-1 py-0.5 text-xs">portfolio.db</code>{" "}
          for <strong>{siteContent.name}</strong>. Regenerate with{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run build:content</code> after DB
          edits.
        </div>

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Profile angle</p>
          <div className="flex flex-wrap gap-2">
            {recruitmentContent.packs.map((pack) => (
              <button
                key={pack.slug}
                type="button"
                onClick={() => setActiveSlug(pack.slug)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  pack.slug === activeSlug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/60",
                )}
              >
                {pack.title}
              </button>
            ))}
          </div>
          {activePack ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Target role: <span className="text-foreground">{activePack.targetRole}</span> · Resume:{" "}
              <a href={activePack.resumeUrl} className="text-primary hover:underline">
                {activePack.resumeUrl}
              </a>
            </p>
          ) : null}
        </div>

        <div className="mb-8 border-b border-border">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Recruitment platform">
            {PLATFORM_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activePlatform === tab.id}
                  onClick={() => setActivePlatform(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    activePlatform === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activePack ? (
          <RecruitmentSectionPanel sections={activeSections} />
        ) : (
          <p className="text-muted-foreground">No recruitment packs found. Run npm run build:content.</p>
        )}
      </main>
    </div>
  );
}
