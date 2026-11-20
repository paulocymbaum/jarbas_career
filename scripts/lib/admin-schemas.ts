import { z } from "zod";

export const projectLinkInputSchema = z.object({
  kind: z.enum(["github", "demo", "case_study", "other"]),
  url: z.string().min(1),
  label: z.string().optional().nullable(),
});

export const siteProfileInputSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  pitch: z.string().min(1),
  aboutParagraphs: z.array(z.string()).min(1),
  photoUrl: z.string().optional().nullable(),
  email: z.string().email(),
  city: z.string().min(1),
  country: z.string().min(1),
  githubUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  twitterUrl: z.string().optional().nullable(),
  footerNote: z.string().optional().nullable(),
});

export const professionalProfileInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  accent: z.string().optional().nullable(),
  resumeUrl: z.string().min(1),
  sortOrder: z.number().int().optional(),
  stack: z.array(z.string()),
  skills: z.array(z.string()),
});

export const experienceInputSchema = z.object({
  role: z.string().min(1),
  company: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  highlights: z.array(z.string()),
  tech: z.array(z.string()),
});

export const projectInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  gradient: z.string().min(1),
  featured: z.boolean().optional(),
  privateRepo: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  links: z.array(projectLinkInputSchema),
  tech: z.array(z.string()),
});

export const educationInputSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const certificationInputSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issuedDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  credentialId: z.string().optional().nullable(),
  verifyUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const skillCategoryInputSchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
  items: z.array(z.string()),
});

export const articleInputSchema = z.object({
  kind: z.enum(["article", "post"]),
  title: z.string().min(1),
  url: z.string().min(1),
  author: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  readTime: z.string().optional().nullable(),
  reactions: z.number().int().nonnegative().optional().nullable(),
  comments: z.number().int().nonnegative().optional().nullable(),
  externalId: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const archiveInputSchema = z.object({
  archived: z.boolean(),
});

export const reorderInputSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

export const githubRepoImportSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  url: z.string().min(1),
  privateRepo: z.boolean().optional(),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}
