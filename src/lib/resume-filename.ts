export const RESUME_FILE_NAME_PREFIX = "your-name";

export function slugifyResumeSegment(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getResumePdfFilename(
  profileSlug: string,
  namePrefix: string = RESUME_FILE_NAME_PREFIX,
): string {
  return `${slugifyResumeSegment(namePrefix)}-${slugifyResumeSegment(profileSlug)}.pdf`;
}

export function getResumePublicPath(
  profileSlug: string,
  namePrefix: string = RESUME_FILE_NAME_PREFIX,
): string {
  return `/resumes/${getResumePdfFilename(profileSlug, namePrefix)}`;
}
