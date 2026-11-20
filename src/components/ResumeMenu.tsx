import { ChevronDown, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteContent } from "@/content/site";
import { trackResumeDownload } from "@/lib/analytics";
import { getProfilesWithResume, getResumeFilename } from "@/lib/resume";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResumeMenuProps = {
  size?: "default" | "sm";
  className?: string;
};

export function ResumeMenu({ size = "sm", className }: ResumeMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profiles = getProfilesWithResume(siteContent.professionalProfiles);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!profiles.length) return null;

  if (profiles.length === 1) {
    const profile = profiles[0];
    return (
      <Button asChild size={size} className={className}>
        <a
          href={profile.resumeUrl}
          download={getResumeFilename(profile)}
          data-analytics-id={`header-resume-download-${profile.slug}`}
          onClick={(event) => trackResumeDownload(profile.slug, "header_menu", event)}
        >
          Resume
        </a>
      </Button>
    );
  }

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <Button
        type="button"
        size={size}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="gap-1.5"
      >
        Resume
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label="Choose a profile resume"
          className="absolute right-0 top-full z-50 mt-2 min-w-[14rem] overflow-hidden rounded-md border border-border bg-card p-1"
        >
          {profiles.map((profile) => (
            <a
              key={profile.slug}
              role="menuitem"
              href={profile.resumeUrl}
              download={getResumeFilename(profile)}
              data-analytics-id={`header-resume-dropdown-${profile.slug}`}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              onClick={(event) => {
                trackResumeDownload(profile.slug, "header_dropdown", event);
                setOpen(false);
              }}
            >
              <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{profile.title}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
