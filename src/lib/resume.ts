import type { ProfessionalProfile } from "@/content/types";
import { getResumePdfFilename } from "@/lib/resume-filename";

export function getResumeFilename(profile: ProfessionalProfile): string {
  return getResumePdfFilename(profile.slug);
}

export function getProfilesWithResume(profiles: ProfessionalProfile[]): ProfessionalProfile[] {
  return profiles.filter((profile) => Boolean(profile.resumeUrl));
}
