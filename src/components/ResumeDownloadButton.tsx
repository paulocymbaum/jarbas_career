import { Download } from "lucide-react";
import type { ProfessionalProfile } from "@/content/types";
import { getResumeFilename } from "@/lib/resume";
import { trackResumeDownload } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResumeDownloadButtonProps = {
  profile: ProfessionalProfile;
  className?: string;
};

export function ResumeDownloadButton({ profile, className }: ResumeDownloadButtonProps) {
  if (!profile.resumeUrl) return null;

  return (
    <div className={cn("mt-auto pt-5", className)}>
      <Button asChild className="w-full">
        <a
          href={profile.resumeUrl}
          download={getResumeFilename(profile)}
          data-analytics-id={`resume-download-${profile.slug}`}
          aria-label={`Download ${profile.title} resume`}
          onClick={(event) => trackResumeDownload(profile.slug, "profile_card", event)}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download PDF
        </a>
      </Button>
    </div>
  );
}
