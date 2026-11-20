import { useState } from "react";
import { siteContent } from "@/content/site";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PREVIEW_COUNT = 10;

function SkillCategoryList({ name, items }: { name: string; items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > PREVIEW_COUNT;
  const visible = expanded || !hasMore ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <div className="bento-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">{name}</h3>
        <span className="font-mono text-[11px] font-medium text-muted-foreground">
          {String(items.length).padStart(2, "0")} ITEMS
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
      {hasMore ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-2 h-auto px-0"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Show less" : `Show all ${items.length}`}
        </Button>
      ) : null}
    </div>
  );
}

export function Skills() {
  if (!siteContent.skills.length) return null;

  return (
    <Section
      id="skills"
      eyebrow="STACK MATRIX · GROUPED BY USAGE"
      title="Skills"
      subtitle="Grouped by how I use them."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {siteContent.skills.map((category) => (
          <SkillCategoryList key={category.name} name={category.name} items={category.items} />
        ))}
      </div>
    </Section>
  );
}
