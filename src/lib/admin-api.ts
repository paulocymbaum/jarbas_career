export type AdminSiteProfile = {
  name: string;
  title: string;
  pitch: string;
  aboutParagraphs: string[];
  photoUrl: string | null;
  email: string;
  city: string;
  country: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  footerNote: string | null;
};

export type AdminProfessionalProfile = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  accent: string | null;
  resumeUrl: string;
  sortOrder: number;
  archived: boolean;
  stack: string[];
  skills: string[];
};

export type AdminExperience = {
  id: number;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  summary: string | null;
  sortOrder: number;
  archived: boolean;
  highlights: string[];
  tech: string[];
};

export type AdminProjectLink = {
  kind: "github" | "demo" | "case_study" | "other";
  url: string;
  label?: string | null;
};

export type AdminProject = {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  gradient: string;
  featured: boolean;
  privateRepo: boolean;
  sortOrder: number;
  archived: boolean;
  links: AdminProjectLink[];
  tech: string[];
};

export type AdminEducation = {
  id: number;
  institution: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  summary: string | null;
  sortOrder: number;
  archived: boolean;
};

export type AdminCertification = {
  id: number;
  name: string;
  issuer: string;
  issuedDate: string | null;
  expiryDate: string | null;
  credentialId: string | null;
  verifyUrl: string | null;
  sortOrder: number;
  archived: boolean;
};

export type AdminSkillCategory = {
  id: number;
  name: string;
  sortOrder: number;
  archived: boolean;
  items: string[];
};

export type AdminArticle = {
  id: number;
  kind: "article" | "post";
  title: string;
  url: string;
  author: string | null;
  source: string | null;
  readTime: string | null;
  reactions: number | null;
  comments: number | null;
  externalId: string | null;
  featured: boolean;
  sortOrder: number;
  archived: boolean;
};

export type GithubRepoListing = {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
  inDatabase: boolean;
  projectId: number | null;
  projectSlug: string | null;
};

export type AdminProjectImageOption = {
  filename: string;
  publicUrl: string;
  isCover: boolean;
};

export type SyncProjectsResult = {
  ok: boolean;
  synced: number;
  skipped: number;
  total: number;
  errors?: string[];
  projectReadmesPath?: string;
};

export type SyncProjectAssetsResult = {
  ok: boolean;
  slug: string;
  synced: number;
  skipped: number;
  errors?: string[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: string }).error)
        : `Request failed (${response.status})`;
    throw new Error(error);
  }

  return body as T;
}

export const adminApi = {
  health: () => request<{ ok: boolean }>("/health"),
  rebuild: () => request<{ ok: boolean }>("/rebuild", { method: "POST" }),
  syncGithubProjects: (slugs?: string[]) =>
    request<SyncProjectsResult>("/sync-github-projects", {
      method: "POST",
      body: JSON.stringify(slugs?.length ? { slugs } : {}),
    }),
  syncProjectAssets: (slug: string) =>
    request<SyncProjectAssetsResult>("/sync-project-assets", {
      method: "POST",
      body: JSON.stringify({ slug }),
    }),

  getGithubRepos: () => request<GithubRepoListing[]>("/github-repos"),
  importGithubRepo: (repo: {
    owner: string;
    repo: string;
    title: string;
    description?: string | null;
    url: string;
    privateRepo?: boolean;
  }) =>
    request<{ ok: boolean; id: number; slug: string; readmeSynced: boolean }>(
      "/github-repos/import",
      {
        method: "POST",
        body: JSON.stringify(repo),
      },
    ),

  getSiteProfile: () => request<AdminSiteProfile>("/site-profile"),
  updateSiteProfile: (data: AdminSiteProfile) =>
    request<{ ok: boolean }>("/site-profile", { method: "PATCH", body: JSON.stringify(data) }),

  getProfessionalProfiles: () => request<AdminProfessionalProfile[]>("/professional-profiles"),
  createProfessionalProfile: (data: Omit<AdminProfessionalProfile, "id" | "archived">) =>
    request<{ ok: boolean; id: number }>("/professional-profiles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProfessionalProfile: (
    id: number,
    data: Omit<AdminProfessionalProfile, "id" | "archived">,
  ) =>
    request<{ ok: boolean }>(`/professional-profiles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  archiveProfessionalProfile: (id: number, archived: boolean) =>
    request<{ ok: boolean }>(`/professional-profiles/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived }),
    }),

  getExperience: () => request<AdminExperience[]>("/experience"),
  createExperience: (data: Omit<AdminExperience, "id" | "archived">) =>
    request<{ ok: boolean; id: number }>("/experience", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateExperience: (id: number, data: Omit<AdminExperience, "id" | "archived">) =>
    request<{ ok: boolean }>(`/experience/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  archiveExperience: (id: number, archived: boolean) =>
    request<{ ok: boolean }>(`/experience/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived }),
    }),

  getProjects: () => request<AdminProject[]>("/projects"),
  getProjectImages: (slug: string) =>
    request<AdminProjectImageOption[]>(`/project-images/${encodeURIComponent(slug)}`),
  createProject: (data: Omit<AdminProject, "id" | "archived">) =>
    request<{ ok: boolean; id: number }>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id: number, data: Omit<AdminProject, "id" | "archived">) =>
    request<{ ok: boolean }>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  archiveProject: (id: number, archived: boolean) =>
    request<{ ok: boolean }>(`/projects/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived }),
    }),

  getEducation: () => request<AdminEducation[]>("/education"),
  createEducation: (data: Omit<AdminEducation, "id" | "archived">) =>
    request<{ ok: boolean; id: number }>("/education", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEducation: (id: number, data: Omit<AdminEducation, "id" | "archived">) =>
    request<{ ok: boolean }>(`/education/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  archiveEducation: (id: number, archived: boolean) =>
    request<{ ok: boolean }>(`/education/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived }),
    }),

  getCertifications: () => request<AdminCertification[]>("/certifications"),
  createCertification: (data: Omit<AdminCertification, "id" | "archived">) =>
    request<{ ok: boolean; id: number }>("/certifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCertification: (id: number, data: Omit<AdminCertification, "id" | "archived">) =>
    request<{ ok: boolean }>(`/certifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  archiveCertification: (id: number, archived: boolean) =>
    request<{ ok: boolean }>(`/certifications/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived }),
    }),

  getSkills: () => request<AdminSkillCategory[]>("/skills"),
  createSkillCategory: (data: Omit<AdminSkillCategory, "id" | "archived">) =>
    request<{ ok: boolean; id: number }>("/skills", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSkillCategory: (id: number, data: Omit<AdminSkillCategory, "id" | "archived">) =>
    request<{ ok: boolean }>(`/skills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  archiveSkillCategory: (id: number, archived: boolean) =>
    request<{ ok: boolean }>(`/skills/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived }),
    }),

  getArticles: () => request<AdminArticle[]>("/articles"),
  createArticle: (data: Omit<AdminArticle, "id" | "archived">) =>
    request<{ ok: boolean; id: number }>("/articles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateArticle: (id: number, data: Omit<AdminArticle, "id" | "archived">) =>
    request<{ ok: boolean }>(`/articles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  archiveArticle: (id: number, archived: boolean) =>
    request<{ ok: boolean }>(`/articles/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived }),
    }),

  reorderProfessionalProfiles: (ids: number[]) =>
    request<{ ok: boolean }>("/professional-profiles/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  reorderExperience: (ids: number[]) =>
    request<{ ok: boolean }>("/experience/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  reorderProjects: (ids: number[]) =>
    request<{ ok: boolean }>("/projects/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  reorderEducation: (ids: number[]) =>
    request<{ ok: boolean }>("/education/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  reorderCertifications: (ids: number[]) =>
    request<{ ok: boolean }>("/certifications/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  reorderSkillCategories: (ids: number[]) =>
    request<{ ok: boolean }>("/skills/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  reorderArticles: (ids: number[]) =>
    request<{ ok: boolean }>("/articles/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};
