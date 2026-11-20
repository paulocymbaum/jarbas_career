import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ProfessionalProfile } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VISIBLE_SKILL_COUNT = 5;

export { VISIBLE_SKILL_COUNT };

type ProfileSkillsModalProps = {
  profile: ProfessionalProfile | null;
  onClose: () => void;
};

export function ProfileSkillsModal({ profile, onClose }: ProfileSkillsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (profile) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [profile]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      className={cn(
        "profile-modal fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,32rem)] -translate-x-1/2 -translate-y-1/2",
        "rounded-lg border border-border bg-card p-0 text-card-foreground",
      )}
      aria-labelledby={profile ? `modal-professional-profile-skills-title-${profile.slug}` : undefined}
    >
      {profile ? (
        <div className="max-h-[min(85vh,40rem)] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={`modal-professional-profile-skills-title-${profile.slug}`}
                  className="text-2xl font-medium tracking-[-0.025em]"
                >
                  {profile.title}
                </h2>
                {profile.summary ? (
                  <p className="mt-1 text-sm text-muted-foreground">{profile.summary}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Close"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {profile.description ? (
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                {profile.description}
              </p>
            ) : null}

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-foreground">
                Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.stack.map((item) => (
                  <Badge key={item}>
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-foreground">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
