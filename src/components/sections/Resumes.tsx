import { siteContent } from "@/content/site";
import { ProfessionalProfiles } from "@/components/sections/ProfessionalProfiles";
import { Section } from "@/components/layout/Section";

/**
 * Role-tailored resumes — promoted to a standalone section after the hero
 * (the hero now substitutes the former About section).
 */
export function Resumes() {
  if (!siteContent.professionalProfiles.length) return null;

  return (
    <Section
      id="resumes"
      eyebrow="ROLE-TAILORED RESUMES"
      title="Resumes"
      subtitle="Three versions of the same career. Download the one that matches the role."
    >
      <ProfessionalProfiles />
    </Section>
  );
}