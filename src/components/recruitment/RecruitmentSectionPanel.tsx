import { CopyableField } from "@/components/recruitment/CopyableField";
import type { RecruitmentSection } from "@/content/types";

type RecruitmentSectionPanelProps = {
  sections: RecruitmentSection[];
};

export function RecruitmentSectionPanel({ sections }: RecruitmentSectionPanelProps) {
  return (
    <div className="space-y-8">
      {sections.map((item) => (
        <section key={item.id} aria-labelledby={`${item.id}-heading`}>
          <div className="mb-4">
            <h3 id={`${item.id}-heading`} className="text-lg font-semibold text-foreground">
              {item.label}
            </h3>
            {item.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            ) : null}
          </div>
          <div className="space-y-4">
            {item.fields.map((field) => (
              <CopyableField key={field.id} field={field} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
