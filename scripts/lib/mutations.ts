import type Database from "better-sqlite3";
import type { z } from "zod";
import { openDatabaseReadWrite } from "./db.js";
import type {
  articleInputSchema,
  certificationInputSchema,
  educationInputSchema,
  experienceInputSchema,
  professionalProfileInputSchema,
  projectInputSchema,
  siteProfileInputSchema,
  skillCategoryInputSchema,
} from "./admin-schemas.js";

type SiteProfileInput = z.infer<typeof siteProfileInputSchema>;
type ProfessionalProfileInput = z.infer<typeof professionalProfileInputSchema>;
type ExperienceInput = z.infer<typeof experienceInputSchema>;
type ProjectInput = z.infer<typeof projectInputSchema>;
type EducationInput = z.infer<typeof educationInputSchema>;
type CertificationInput = z.infer<typeof certificationInputSchema>;
type SkillCategoryInput = z.infer<typeof skillCategoryInputSchema>;
type ArticleInput = z.infer<typeof articleInputSchema>;

function replaceStringChildren(
  db: Database.Database,
  deleteSql: string,
  insertSql: string,
  parentId: number,
  values: string[],
): void {
  db.prepare(deleteSql).run(parentId);
  const insert = db.prepare(insertSql);
  values.forEach((value, index) => {
    insert.run(parentId, value, index);
  });
}

function replaceProfileChips(
  db: Database.Database,
  profileId: number,
  stack: string[],
  skills: string[],
): void {
  db.prepare("DELETE FROM professional_profile_chip WHERE profile_id = ?").run(profileId);
  const insert = db.prepare(
    "INSERT INTO professional_profile_chip (profile_id, label, kind, sort_order) VALUES (?, ?, ?, ?)",
  );
  stack.forEach((label, index) => insert.run(profileId, label, "stack", index));
  skills.forEach((label, index) => insert.run(profileId, label, "skill", index));
}

function replaceProjectChildren(db: Database.Database, projectId: number, input: ProjectInput): void {
  db.prepare("DELETE FROM project_link WHERE project_id = ?").run(projectId);
  const insertLink = db.prepare(
    "INSERT INTO project_link (project_id, kind, url, label, sort_order) VALUES (?, ?, ?, ?, ?)",
  );
  input.links.forEach((link, index) => {
    insertLink.run(projectId, link.kind, link.url, link.label ?? null, index);
  });

  replaceStringChildren(
    db,
    "DELETE FROM project_tech WHERE project_id = ?",
    "INSERT INTO project_tech (project_id, label, sort_order) VALUES (?, ?, ?)",
    projectId,
    input.tech,
  );
}

export function updateSiteProfile(input: SiteProfileInput): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare(
      `UPDATE site_profile SET
        name = ?, title = ?, pitch = ?, about_paragraphs = ?,
        photo_url = ?, email = ?, city = ?, country = ?,
        github_url = ?, linkedin_url = ?, twitter_url = ?,
        footer_note = ?, updated_at = datetime('now')
      WHERE id = 1`,
    ).run(
      input.name,
      input.title,
      input.pitch,
      JSON.stringify(input.aboutParagraphs),
      input.photoUrl ?? null,
      input.email,
      input.city,
      input.country,
      input.githubUrl ?? null,
      input.linkedinUrl ?? null,
      input.twitterUrl ?? null,
      input.footerNote ?? null,
    );
  } finally {
    db.close();
  }
}

export function createProfessionalProfile(input: ProfessionalProfileInput): number {
  const db = openDatabaseReadWrite();
  try {
    const tx = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO professional_profile (title, slug, summary, description, accent, resume_url, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.title,
          input.slug,
          input.summary ?? null,
          input.description ?? null,
          input.accent ?? null,
          input.resumeUrl,
          input.sortOrder ?? 0,
        );
      const id = Number(result.lastInsertRowid);
      replaceProfileChips(db, id, input.stack, input.skills);
      return id;
    });
    return tx();
  } finally {
    db.close();
  }
}

export function updateProfessionalProfile(id: number, input: ProfessionalProfileInput): void {
  const db = openDatabaseReadWrite();
  try {
    const tx = db.transaction(() => {
      db.prepare(
        `UPDATE professional_profile SET
          title = ?, slug = ?, summary = ?, description = ?,
          accent = ?, resume_url = ?, sort_order = ?
        WHERE id = ?`,
      ).run(
        input.title,
        input.slug,
        input.summary ?? null,
        input.description ?? null,
        input.accent ?? null,
        input.resumeUrl,
        input.sortOrder ?? 0,
        id,
      );
      replaceProfileChips(db, id, input.stack, input.skills);
    });
    tx();
  } finally {
    db.close();
  }
}

export function setProfessionalProfileArchived(id: number, archived: boolean): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare("UPDATE professional_profile SET archived = ? WHERE id = ?").run(
      archived ? 1 : 0,
      id,
    );
  } finally {
    db.close();
  }
}

export function createExperience(input: ExperienceInput): number {
  const db = openDatabaseReadWrite();
  try {
    const tx = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO experience (role, company, start_date, end_date, location, summary, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.role,
          input.company,
          input.startDate,
          input.endDate ?? null,
          input.location ?? null,
          input.summary ?? null,
          input.sortOrder ?? 0,
        );
      const id = Number(result.lastInsertRowid);
      replaceStringChildren(
        db,
        "DELETE FROM experience_highlight WHERE experience_id = ?",
        "INSERT INTO experience_highlight (experience_id, body, sort_order) VALUES (?, ?, ?)",
        id,
        input.highlights,
      );
      replaceStringChildren(
        db,
        "DELETE FROM experience_tech WHERE experience_id = ?",
        "INSERT INTO experience_tech (experience_id, label, sort_order) VALUES (?, ?, ?)",
        id,
        input.tech,
      );
      return id;
    });
    return tx();
  } finally {
    db.close();
  }
}

export function updateExperience(id: number, input: ExperienceInput): void {
  const db = openDatabaseReadWrite();
  try {
    const tx = db.transaction(() => {
      db.prepare(
        `UPDATE experience SET
          role = ?, company = ?, start_date = ?, end_date = ?,
          location = ?, summary = ?, sort_order = ?
        WHERE id = ?`,
      ).run(
        input.role,
        input.company,
        input.startDate,
        input.endDate ?? null,
        input.location ?? null,
        input.summary ?? null,
        input.sortOrder ?? 0,
        id,
      );
      replaceStringChildren(
        db,
        "DELETE FROM experience_highlight WHERE experience_id = ?",
        "INSERT INTO experience_highlight (experience_id, body, sort_order) VALUES (?, ?, ?)",
        id,
        input.highlights,
      );
      replaceStringChildren(
        db,
        "DELETE FROM experience_tech WHERE experience_id = ?",
        "INSERT INTO experience_tech (experience_id, label, sort_order) VALUES (?, ?, ?)",
        id,
        input.tech,
      );
    });
    tx();
  } finally {
    db.close();
  }
}

export function setExperienceArchived(id: number, archived: boolean): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare("UPDATE experience SET archived = ? WHERE id = ?").run(archived ? 1 : 0, id);
  } finally {
    db.close();
  }
}

export function createProject(input: ProjectInput): number {
  const db = openDatabaseReadWrite();
  try {
    const tx = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO project (title, slug, description, image_url, gradient, featured, private_repo, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.title,
          input.slug,
          input.description,
          input.imageUrl ?? null,
          input.gradient,
          input.featured ? 1 : 0,
          input.privateRepo ? 1 : 0,
          input.sortOrder ?? 0,
        );
      const id = Number(result.lastInsertRowid);
      replaceProjectChildren(db, id, input);
      return id;
    });
    return tx();
  } finally {
    db.close();
  }
}

export function updateProject(id: number, input: ProjectInput): void {
  const db = openDatabaseReadWrite();
  try {
    const tx = db.transaction(() => {
      db.prepare(
        `UPDATE project SET
          title = ?, slug = ?, description = ?, image_url = ?,
          gradient = ?, featured = ?, private_repo = ?, sort_order = ?
        WHERE id = ?`,
      ).run(
        input.title,
        input.slug,
        input.description,
        input.imageUrl ?? null,
        input.gradient,
        input.featured ? 1 : 0,
        input.privateRepo ? 1 : 0,
        input.sortOrder ?? 0,
        id,
      );
      replaceProjectChildren(db, id, input);
    });
    tx();
  } finally {
    db.close();
  }
}

export function setProjectArchived(id: number, archived: boolean): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare("UPDATE project SET archived = ? WHERE id = ?").run(archived ? 1 : 0, id);
  } finally {
    db.close();
  }
}

function repoNameToSlug(name: string): string {
  return name
    .replace(/\.git$/i, "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function uniqueProjectSlug(db: ReturnType<typeof openDatabaseReadWrite>, baseSlug: string): string {
  let slug = baseSlug;
  let suffix = 2;
  while (db.prepare("SELECT 1 FROM project WHERE slug = ?").get(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export function importProjectFromGithub(input: {
  owner: string;
  repo: string;
  title: string;
  description: string;
  url: string;
  privateRepo: boolean;
}): { id: number; slug: string } {
  const db = openDatabaseReadWrite();
  try {
    const baseSlug = repoNameToSlug(input.repo);
    const slug = uniqueProjectSlug(db, baseSlug);
    const maxSort =
      (db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM project").get() as {
        max_sort: number;
      }).max_sort + 1;

    const tx = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO project (title, slug, description, image_url, gradient, featured, private_repo, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.title,
          slug,
          input.description || `${input.title} — imported from GitHub.`,
          null,
          "from-slate-900 via-slate-600 to-slate-300",
          0,
          input.privateRepo ? 1 : 0,
          maxSort,
        );
      const id = Number(result.lastInsertRowid);
      db.prepare(
        "INSERT INTO project_link (project_id, kind, url, label, sort_order) VALUES (?, 'github', ?, NULL, 0)",
      ).run(id, input.url);
      return { id, slug };
    });

    return tx();
  } finally {
    db.close();
  }
}

export function createEducation(input: EducationInput): number {
  const db = openDatabaseReadWrite();
  try {
    const result = db
      .prepare(
        `INSERT INTO education (institution, degree, field, start_date, end_date, location, summary, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.institution,
        input.degree,
        input.field ?? null,
        input.startDate ?? null,
        input.endDate ?? null,
        input.location ?? null,
        input.summary ?? null,
        input.sortOrder ?? 0,
      );
    return Number(result.lastInsertRowid);
  } finally {
    db.close();
  }
}

export function updateEducation(id: number, input: EducationInput): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare(
      `UPDATE education SET
        institution = ?, degree = ?, field = ?, start_date = ?,
        end_date = ?, location = ?, summary = ?, sort_order = ?
      WHERE id = ?`,
    ).run(
      input.institution,
      input.degree,
      input.field ?? null,
      input.startDate ?? null,
      input.endDate ?? null,
      input.location ?? null,
      input.summary ?? null,
      input.sortOrder ?? 0,
      id,
    );
  } finally {
    db.close();
  }
}

export function setEducationArchived(id: number, archived: boolean): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare("UPDATE education SET archived = ? WHERE id = ?").run(archived ? 1 : 0, id);
  } finally {
    db.close();
  }
}

export function createCertification(input: CertificationInput): number {
  const db = openDatabaseReadWrite();
  try {
    const result = db
      .prepare(
        `INSERT INTO certification (name, issuer, issued_date, expiry_date, credential_id, verify_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.name,
        input.issuer,
        input.issuedDate ?? null,
        input.expiryDate ?? null,
        input.credentialId ?? null,
        input.verifyUrl ?? null,
        input.sortOrder ?? 0,
      );
    return Number(result.lastInsertRowid);
  } finally {
    db.close();
  }
}

export function updateCertification(id: number, input: CertificationInput): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare(
      `UPDATE certification SET
        name = ?, issuer = ?, issued_date = ?, expiry_date = ?,
        credential_id = ?, verify_url = ?, sort_order = ?
      WHERE id = ?`,
    ).run(
      input.name,
      input.issuer,
      input.issuedDate ?? null,
      input.expiryDate ?? null,
      input.credentialId ?? null,
      input.verifyUrl ?? null,
      input.sortOrder ?? 0,
      id,
    );
  } finally {
    db.close();
  }
}

export function setCertificationArchived(id: number, archived: boolean): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare("UPDATE certification SET archived = ? WHERE id = ?").run(archived ? 1 : 0, id);
  } finally {
    db.close();
  }
}

export function createSkillCategory(input: SkillCategoryInput): number {
  const db = openDatabaseReadWrite();
  try {
    const tx = db.transaction(() => {
      const result = db
        .prepare("INSERT INTO skill_category (name, sort_order) VALUES (?, ?)")
        .run(input.name, input.sortOrder ?? 0);
      const id = Number(result.lastInsertRowid);
      replaceStringChildren(
        db,
        "DELETE FROM skill_item WHERE category_id = ?",
        "INSERT INTO skill_item (category_id, label, sort_order) VALUES (?, ?, ?)",
        id,
        input.items,
      );
      return id;
    });
    return tx();
  } finally {
    db.close();
  }
}

export function updateSkillCategory(id: number, input: SkillCategoryInput): void {
  const db = openDatabaseReadWrite();
  try {
    const tx = db.transaction(() => {
      db.prepare("UPDATE skill_category SET name = ?, sort_order = ? WHERE id = ?").run(
        input.name,
        input.sortOrder ?? 0,
        id,
      );
      replaceStringChildren(
        db,
        "DELETE FROM skill_item WHERE category_id = ?",
        "INSERT INTO skill_item (category_id, label, sort_order) VALUES (?, ?, ?)",
        id,
        input.items,
      );
    });
    tx();
  } finally {
    db.close();
  }
}

export function setSkillCategoryArchived(id: number, archived: boolean): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare("UPDATE skill_category SET archived = ? WHERE id = ?").run(archived ? 1 : 0, id);
  } finally {
    db.close();
  }
}

export function createArticle(input: ArticleInput): number {
  const db = openDatabaseReadWrite();
  try {
    const result = db
      .prepare(
        `INSERT INTO article (kind, title, url, author, source, read_time, reactions, comments, external_id, featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.kind,
        input.title,
        input.url,
        input.author ?? null,
        input.source ?? null,
        input.readTime ?? null,
        input.reactions ?? null,
        input.comments ?? null,
        input.externalId ?? null,
        input.featured ? 1 : 0,
        input.sortOrder ?? 0,
      );
    return Number(result.lastInsertRowid);
  } finally {
    db.close();
  }
}

export function updateArticle(id: number, input: ArticleInput): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare(
      `UPDATE article SET
        kind = ?, title = ?, url = ?, author = ?, source = ?,
        read_time = ?, reactions = ?, comments = ?, external_id = ?,
        featured = ?, sort_order = ?
      WHERE id = ?`,
    ).run(
      input.kind,
      input.title,
      input.url,
      input.author ?? null,
      input.source ?? null,
      input.readTime ?? null,
      input.reactions ?? null,
      input.comments ?? null,
      input.externalId ?? null,
      input.featured ? 1 : 0,
      input.sortOrder ?? 0,
      id,
    );
  } finally {
    db.close();
  }
}

export function setArticleArchived(id: number, archived: boolean): void {
  const db = openDatabaseReadWrite();
  try {
    db.prepare("UPDATE article SET archived = ? WHERE id = ?").run(archived ? 1 : 0, id);
  } finally {
    db.close();
  }
}

function reorderByIds(db: Database.Database, table: string, ids: number[]): void {
  const update = db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`);
  const tx = db.transaction(() => {
    ids.forEach((id, index) => {
      update.run(index, id);
    });
  });
  tx();
}

export function reorderProfessionalProfiles(ids: number[]): void {
  const db = openDatabaseReadWrite();
  try {
    reorderByIds(db, "professional_profile", ids);
  } finally {
    db.close();
  }
}

export function reorderExperience(ids: number[]): void {
  const db = openDatabaseReadWrite();
  try {
    reorderByIds(db, "experience", ids);
  } finally {
    db.close();
  }
}

export function reorderProjects(ids: number[]): void {
  const db = openDatabaseReadWrite();
  try {
    reorderByIds(db, "project", ids);
  } finally {
    db.close();
  }
}

export function reorderEducation(ids: number[]): void {
  const db = openDatabaseReadWrite();
  try {
    reorderByIds(db, "education", ids);
  } finally {
    db.close();
  }
}

export function reorderCertifications(ids: number[]): void {
  const db = openDatabaseReadWrite();
  try {
    reorderByIds(db, "certification", ids);
  } finally {
    db.close();
  }
}

export function reorderSkillCategories(ids: number[]): void {
  const db = openDatabaseReadWrite();
  try {
    reorderByIds(db, "skill_category", ids);
  } finally {
    db.close();
  }
}

export function reorderArticles(ids: number[]): void {
  const db = openDatabaseReadWrite();
  try {
    reorderByIds(db, "article", ids);
  } finally {
    db.close();
  }
}
