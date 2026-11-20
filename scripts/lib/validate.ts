import { z } from "zod";
import type { SiteContent } from "../../src/content/types.js";

const projectLinkSchema = z.object({
  kind: z.enum(["github", "demo", "case_study", "other"]),
  url: z.string().min(1),
  label: z.string().optional(),
});

const experienceSchema = z.object({
  role: z.string().min(1),
  company: z.string().min(1),
  start: z.string().min(1),
  end: z.string().nullable(),
  location: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()),
  tech: z.array(z.string()),
});

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  featured: z.boolean(),
  privateRepo: z.boolean().optional(),
  imageUrl: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  tech: z.array(z.string()),
  links: z.array(projectLinkSchema),
  gradient: z.string().min(1),
});

const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  start: z.string().optional(),
  end: z.string().nullable().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issuedDate: z.string().optional(),
  expiryDate: z.string().nullable().optional(),
  verifyUrl: z.string().optional(),
});

const skillCategorySchema = z.object({
  name: z.string().min(1),
  items: z.array(z.string()),
});

const articleSchema = z.object({
  kind: z.enum(["article", "post"]),
  title: z.string().min(1),
  url: z.string().url(),
  author: z.string().optional(),
  source: z.string().optional(),
  readTime: z.string().optional(),
  reactions: z.number().int().nonnegative().optional(),
  comments: z.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
});

const professionalProfileSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().optional(),
  stack: z.array(z.string()),
  skills: z.array(z.string()),
  accent: z.string(),
  resumeUrl: z.string().min(1),
});

const siteContentSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  pitch: z.string().min(1),
  aboutParagraphs: z.array(z.string()).min(1),
  photoUrl: z.string().min(1).optional(),
  professionalProfiles: z.array(professionalProfileSchema).min(1),
  email: z.string().email(),
  city: z.string().min(1),
  country: z.string().min(1),
  links: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }),
  footerNote: z.string().optional(),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillCategorySchema),
  certifications: z.array(certificationSchema),
  articles: z.array(articleSchema),
});

export function validateSiteContent(content: SiteContent): SiteContent {
  const result = siteContentSchema.safeParse(content);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Validação do conteúdo falhou:\n${details}`);
  }

  return result.data;
}

const resumeProjectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  tech: z.array(z.string()),
});

const profileCvDocumentSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  headline: z.string().min(1),
  targetRole: z.string().min(1),
  summary: z.string().min(1),
  keywords: z.array(z.string()),
  skills: z.array(skillCategorySchema),
  experience: z.array(experienceSchema),
  projects: z.array(resumeProjectSchema),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  pdfPath: z.string().min(1),
  locale: z.string().min(1),
  contentVersion: z.number().int().positive(),
  pageCount: z.number().int().positive().optional(),
  generatedAt: z.string().optional(),
});

export function validateProfileCvDocuments(
  documents: import("../../src/content/types.js").ProfileCvDocument[],
): void {
  for (const doc of documents) {
    const result = profileCvDocumentSchema.safeParse(doc);
    if (!result.success) {
      const details = result.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new Error(`Validação do CV "${doc.slug}" falhou:\n${details}`);
    }
  }
}
