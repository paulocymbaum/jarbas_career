export type Article = {
  kind: "article" | "post";
  title: string;
  url: string;
  author?: string;
  source?: string;
  readTime?: string;
  reactions?: number;
  comments?: number;
  featured?: boolean;
};

export type ProjectLink = {
  kind: "github" | "demo" | "case_study" | "other";
  url: string;
  label?: string;
};

export type Experience = {
  role: string;
  company: string;
  start: string;
  end: string | null;
  location?: string;
  summary?: string;
  highlights: string[];
  tech: string[];
};

export type Project = {
  title: string;
  slug: string;
  description: string;
  featured: boolean;
  privateRepo?: boolean;
  imageUrl?: string;
  screenshots?: string[];
  tech: string[];
  links: ProjectLink[];
  gradient: string;
};

export type Education = {
  institution: string;
  degree: string;
  start?: string;
  end?: string | null;
  location?: string;
  summary?: string;
};

export type Certification = {
  name: string;
  issuer: string;
  issuedDate?: string;
  expiryDate?: string | null;
  verifyUrl?: string;
};

export type GithubContributionDay = {
  date: string;
  count: number;
};

export type GithubActivitySnapshot = {
  username: string;
  totalContributions: number;
  includesPrivateContributions: boolean;
  fetchedAt: string | null;
  from: string | null;
  to: string | null;
  weeks: GithubContributionDay[][];
};

export type SkillCategory = {
  name: string;
  items: string[];
};

export type ProfessionalProfile = {
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  stack: string[];
  skills: string[];
  accent: string;
  resumeUrl: string;
};

export type ResumeContact = {
  name: string;
  email: string;
  city: string;
  country: string;
  github?: string;
  linkedin?: string;
  portfolioUrl?: string;
};

export type ResumeProject = {
  title: string;
  slug: string;
  description: string;
  tech: string[];
};

export type ProfileCvDocument = {
  slug: string;
  title: string;
  headline: string;
  targetRole: string;
  summary: string;
  keywords: string[];
  skills: SkillCategory[];
  experience: Experience[];
  projects: ResumeProject[];
  education: Education[];
  certifications: Certification[];
  pdfPath: string;
  locale: string;
  contentVersion: number;
  pageCount?: number;
  generatedAt?: string;
};

export type SiteContent = {
  name: string;
  title: string;
  pitch: string;
  aboutParagraphs: string[];
  photoUrl?: string;
  professionalProfiles: ProfessionalProfile[];
  email: string;
  city: string;
  country: string;
  links: {
    github?: string;
    linkedin?: string;
  };
  footerNote?: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
  articles: Article[];
};

export type RecruitmentField = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  multiline?: boolean;
};

export type RecruitmentSection = {
  id: string;
  label: string;
  description?: string;
  fields: RecruitmentField[];
};

export type RecruitmentPack = {
  slug: string;
  title: string;
  targetRole: string;
  resumeUrl: string;
  upwork: RecruitmentSection[];
  linkedin: RecruitmentSection[];
  general: RecruitmentSection[];
};

export type RecruitmentContent = {
  packs: RecruitmentPack[];
};

export type FreelanceDeliverable = {
  label: string;
  outcome?: string;
};

export type FreelanceService = {
  id: string;
  title: string;
  description: string;
  deliverables: (string | FreelanceDeliverable)[];
  tech: string[];
};

export type FreelanceObjections = {
  title: string;
  pains: string[];
  reassurance: string;
};

export type FreelanceSkillGroup = {
  name: string;
  blurb: string;
  items: string[];
};

export type FreelanceEngagementStep = {
  title: string;
  description: string;
};

export type FreelanceProofPoint = {
  value: string;
  label: string;
};

export type FreelanceFaqItem = {
  question: string;
  answer: string;
};

export type FreelanceCommercialEngagement = {
  title: string;
  org: string;
  description: string;
};

export type FreelanceContent = {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
  };
  services: FreelanceService[];
  skillGroups: FreelanceSkillGroup[];
  /** Objection-handling block ("Sound familiar?") rendered between Services and Work. */
  objections: FreelanceObjections;
  /** Curated project slugs for the work grid — commercial products first. */
  workProjectSlugs: string[];
  /** Client work (companies) shown as a band above the project grid. */
  commercialEngagements: FreelanceCommercialEngagement[];
  engagement: {
    steps: FreelanceEngagementStep[];
    note: string;
  };
  faq: FreelanceFaqItem[];
  proofPoints: FreelanceProofPoint[];
  cta: {
    headline: string;
    subheadline: string;
  };
};
