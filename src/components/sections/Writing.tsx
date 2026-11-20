import { siteContent } from "@/content/site";
import { WritingStack } from "@/components/WritingShowcase";
import { Section } from "@/components/layout/Section";

export function Writing() {
  if (!siteContent.articles.length) return null;

  return (
    <Section
      id="writing"
      eyebrow="PUBLISHED THINKING"
      title="Writing"
      subtitle="LinkedIn posts about the work above."
    >
      <WritingStack articles={siteContent.articles} />
    </Section>
  );
}
