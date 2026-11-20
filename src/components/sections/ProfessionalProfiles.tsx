import { useEffect, useMemo, useState } from "react";
import { siteContent } from "@/content/site";
import { useProfileFromUrl } from "@/hooks/use-profile-from-url";
import { ResumeDownloadButton } from "@/components/ResumeDownloadButton";
import { ProfileSkillsModal } from "@/components/ProfileSkillsModal";
import { RoleSwitcher, type RoleSwitcherItem } from "@/components/bento";
import { RoleEvidence } from "@/components/sections/RoleEvidence";
import { PROFESSIONAL_PROFILES_SECTION_ID, professionalProfileCardId } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProfessionalProfile } from "@/content/types";
import { cn } from "@/lib/utils";

/** Skills shown on the All Roles card before the "+N more" count chip. */
const SKILL_PREVIEW_COUNT = 5;

function ProfessionalProfileDetailCard({
  profile,
  highlighted,
  onSeeMoreSkills,
  skillsPreview = false,
}: {
  profile: ProfessionalProfile;
  highlighted?: boolean;
  onSeeMoreSkills: () => void;
  /** All Roles mode: keep the skill preview + the "+N more" count visible. */
  skillsPreview?: boolean;
}) {
  /** All Roles preview: lead with Python only when the stack row doesn't already show it. */
  const previewSkills = useMemo(() => {
    const pythonInStack = profile.stack.includes("Python");
    const pythonSkill = profile.skills.includes("Python");
    const leads = !pythonInStack && pythonSkill ? ["Python"] : [];
    return [...new Set([...leads, ...profile.skills])];
  }, [profile]);
  const shownSkills = previewSkills.slice(0, SKILL_PREVIEW_COUNT);
  const moreCount = previewSkills.length - shownSkills.length;

  return (
    <div
      id={professionalProfileCardId(profile.slug)}
      data-profile-card
      data-analytics-id={`professional-profile-card-${profile.slug}`}
      className={cn(
        "bento-panel bento-panel-hover relative flex h-full flex-col overflow-hidden p-4",
        highlighted && "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      {/* Accent gradient bar from the profile data. */}
      <span
        className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r", profile.accent)}
        aria-hidden="true"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold leading-6 tracking-tight">{profile.title}</p>
        <span className="label-caps shrink-0">PDF</span>
      </div>
      {skillsPreview ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {profile.description}
        </p>
      ) : (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {profile.summary}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.stack.map((item) => (
          <Badge key={item} variant="core">
            {item}
          </Badge>
        ))}
      </div>

      {skillsPreview ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {shownSkills.map((item) => (
            <Badge key={item}>{item}</Badge>
          ))}
          {moreCount > 0 ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-1 py-0 text-xs"
              data-analytics-id={`professional-profile-skills-more-${profile.slug}`}
              onClick={onSeeMoreSkills}
            >
              +{moreCount} more
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
          FULL SKILL MATRIX IN THE EVIDENCE CARD BELOW ↓
        </p>
      )}

      <ResumeDownloadButton profile={profile} className="pt-3" />
    </div>
  );
}

export function ProfessionalProfiles() {
  const activeSlug = useProfileFromUrl();
  const profiles = siteContent.professionalProfiles;
  const [modalProfile, setModalProfile] = useState<ProfessionalProfile | null>(null);
  const [lens, setLens] = useState("all");

  // Deep links (?profile=slug) preselect the matching role in the switcher.
  useEffect(() => {
    if (activeSlug && profiles.some((profile) => profile.slug === activeSlug)) {
      setLens(activeSlug);
    }
  }, [activeSlug, profiles]);

  if (!profiles.length) return null;

  const lensItems: RoleSwitcherItem[] = [
    { id: "all", label: "All roles" },
    ...profiles.map((profile) => ({ id: profile.slug, label: profile.title })),
  ];
  const visibleProfiles =
    lens === "all" ? profiles : profiles.filter((profile) => profile.slug === lens);
  const selectedProfile =
    lens === "all" ? null : profiles.find((profile) => profile.slug === lens) ?? null;

  return (
    <>
      {/* Kept for analytics tracking + ?profile= deep-link scroll target. */}
      <div id={PROFESSIONAL_PROFILES_SECTION_ID} className="min-w-0">
        <RoleSwitcher
          items={lensItems}
          value={lens}
          onChange={setLens}
          ariaLabel="Filter resumes by role"
          analyticsPrefix="resumes-lens"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProfiles.map((profile) => (
            <ProfessionalProfileDetailCard
              key={profile.slug}
              profile={profile}
              skillsPreview={lens === "all"}
              highlighted={activeSlug === profile.slug}
              onSeeMoreSkills={() => setModalProfile(profile)}
            />
          ))}
        </div>

        {/* Authority cards for the selected role (FEI degree on all of them). */}
        {selectedProfile ? <RoleEvidence key={lens} profile={selectedProfile} /> : null}
      </div>

      <ProfileSkillsModal profile={modalProfile} onClose={() => setModalProfile(null)} />
    </>
  );
}
