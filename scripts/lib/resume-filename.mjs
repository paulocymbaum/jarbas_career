export const RESUME_FILE_NAME_PREFIX = "your-name";

export function slugifyResumeSegment(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getResumePdfFilename(profileSlug, namePrefix = RESUME_FILE_NAME_PREFIX) {
  return `${slugifyResumeSegment(namePrefix)}-${slugifyResumeSegment(profileSlug)}.pdf`;
}

export function getResumePublicPath(profileSlug, namePrefix = RESUME_FILE_NAME_PREFIX) {
  return `/resumes/${getResumePdfFilename(profileSlug, namePrefix)}`;
}
