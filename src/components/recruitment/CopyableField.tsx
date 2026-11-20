import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecruitmentField } from "@/content/types";

type CopyableFieldProps = {
  field: RecruitmentField;
};

export function CopyableField({ field }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(field.value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{field.label}</h4>
          {field.hint ? <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p> : null}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        className={cn(
          "whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90",
          field.multiline && "max-h-[28rem] overflow-y-auto rounded-md bg-muted/40 p-3",
        )}
      >
        {field.value}
      </pre>
    </div>
  );
}
