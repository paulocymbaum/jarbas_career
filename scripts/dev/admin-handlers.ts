import type { IncomingMessage, ServerResponse } from "node:http";
import { openDatabaseReadonly } from "../lib/db.js";
import {
  archiveInputSchema,
  articleInputSchema,
  certificationInputSchema,
  educationInputSchema,
  experienceInputSchema,
  formatZodError,
  githubRepoImportSchema,
  professionalProfileInputSchema,
  projectInputSchema,
  reorderInputSchema,
  siteProfileInputSchema,
  skillCategoryInputSchema,
} from "../lib/admin-schemas.js";
import {
  createArticle,
  createCertification,
  createEducation,
  createExperience,
  createProfessionalProfile,
  createProject,
  createSkillCategory,
  importProjectFromGithub,
  reorderArticles,
  reorderCertifications,
  reorderEducation,
  reorderExperience,
  reorderProfessionalProfiles,
  reorderProjects,
  reorderSkillCategories,
  setArticleArchived,
  setCertificationArchived,
  setEducationArchived,
  setExperienceArchived,
  setProfessionalProfileArchived,
  setProjectArchived,
  setSkillCategoryArchived,
  updateArticle,
  updateCertification,
  updateEducation,
  updateExperience,
  updateProfessionalProfile,
  updateProject,
  updateSiteProfile,
  updateSkillCategory,
} from "../lib/mutations.js";
import {
  fetchArticlesAdmin,
  fetchCertificationsAdmin,
  fetchEducationAdmin,
  fetchExperienceAdmin,
  fetchProfessionalProfileChips,
  fetchProfessionalProfilesAdmin,
  fetchProjectsAdmin,
  fetchSiteProfile,
  fetchSkillsAdmin,
} from "../lib/queries.js";
import { rebuildContent, rebuildProjectReadmesFromDb } from "../lib/rebuild-content.js";
import { dumpDatabaseToSeed } from "../lib/dump-seed.js";
import {
  listGithubReposForAdmin,
  syncGithubProjectsFromDatabase,
} from "../lib/github-projects-sync.js";
import {
  ensureProjectImageUrlPublished,
  listProjectImageOptions,
  resolveProjectRepo,
  syncProjectAssets,
} from "../lib/github-project-assets.js";
import {
  mapArticleApi,
  mapCertificationApi,
  mapEducationApi,
  mapExperienceApi,
  mapProfessionalProfileApi,
  mapProjectApi,
  mapSiteProfileApi,
  mapSkillCategoryApi,
} from "./admin-mappers.js";

type HandlerResult = {
  status: number;
  body: unknown;
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

async function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  const raw = await readBody(req);
  if (!raw.trim()) return {};
  return JSON.parse(raw) as unknown;
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function rebuildContentAndDumpSeed(): ReturnType<typeof rebuildContent> {
  const result = rebuildContent();
  try {
    dumpDatabaseToSeed();
  } catch (error) {
    console.warn("seed export skipped:", errorMessage(error));
  }
  return result;
}

function mutateAndRebuild(mutate: () => void): HandlerResult {
  mutate();
  rebuildContentAndDumpSeed();
  return { status: 200, body: { ok: true } };
}

async function handleReorder(
  req: IncomingMessage,
  res: ServerResponse,
  reorder: (ids: number[]) => void,
): Promise<boolean> {
  const parsed = reorderInputSchema.safeParse(await parseJsonBody(req));
  if (!parsed.success) {
    json(res, 400, { error: formatZodError(parsed.error) });
    return true;
  }
  const result = mutateAndRebuild(() => reorder(parsed.data.ids));
  json(res, result.status, result.body);
  return true;
}

export async function handleAdminRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<void> {
  try {
    const method = req.method ?? "GET";
    const segments = pathname.replace(/^\/api\/admin\/?/, "").split("/").filter(Boolean);
    const resource = segments[0] ?? "";
    const idSegment = segments[1];
    const action = segments[2];
    const id = idSegment ? Number(idSegment) : undefined;

    if (method === "GET" && resource === "health") {
      json(res, 200, { ok: true });
      return;
    }

    if (method === "POST" && resource === "rebuild") {
      const result = rebuildContentAndDumpSeed();
      json(res, 200, { ok: true, ...result });
      return;
    }

    if (method === "POST" && resource === "sync-github-projects") {
      const body = (await parseJsonBody(req)) as { slugs?: unknown };
      const slugs = Array.isArray(body.slugs)
        ? body.slugs.filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
        : undefined;

      const db = openDatabaseReadonly();
      let syncResult;
      try {
        const projects = fetchProjectsAdmin(db);
        syncResult = await syncGithubProjectsFromDatabase(projects, { slugs });
      } finally {
        db.close();
      }

      const projectReadmesPath = rebuildProjectReadmesFromDb();
      json(res, 200, { ok: true, ...syncResult, projectReadmesPath });
      return;
    }

    if (method === "POST" && resource === "sync-project-assets") {
      const body = (await parseJsonBody(req)) as { slug?: unknown };
      const slug = typeof body.slug === "string" ? body.slug.trim() : "";
      if (!slug) {
        json(res, 400, { error: "slug is required" });
        return;
      }

      const db = openDatabaseReadonly();
      try {
        const row = fetchProjectsAdmin(db).find((project) => project.slug === slug);
        if (!row) {
          json(res, 404, { error: `Project not found: ${slug}` });
          return;
        }

        const links = JSON.parse(row.links || "[]") as Array<{ kind: string; url: string }>;
        const repoInfo = resolveProjectRepo({ slug, links });
        if (!repoInfo) {
          json(res, 400, { error: "No GitHub repository link found for this project." });
          return;
        }

        const result = await syncProjectAssets({
          slugs: [slug],
          featuredOnly: false,
          updateDatabase: false,
          additionalProjects: [{ slug, owner: repoInfo.owner, repo: repoInfo.repo }],
        });

        json(res, 200, {
          ok: true,
          slug,
          synced: result.synced,
          skipped: result.skipped,
          errors: result.errors,
        });
      } finally {
        db.close();
      }
      return;
    }

    if (resource === "project-images") {
      if (method === "GET" && idSegment) {
        json(res, 200, listProjectImageOptions(idSegment));
        return;
      }
      json(res, 404, { error: "Not found" });
      return;
    }

    const db = openDatabaseReadonly();
    try {
      if (resource === "site-profile") {
        if (method === "GET") {
          const profile = fetchSiteProfile(db);
          if (!profile) {
            json(res, 404, { error: "site_profile not found" });
            return;
          }
          json(res, 200, mapSiteProfileApi(profile));
          return;
        }

        if (method === "PATCH") {
          const parsed = siteProfileInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          const result = mutateAndRebuild(() => updateSiteProfile(parsed.data));
          json(res, result.status, result.body);
          return;
        }
      }

      if (resource === "professional-profiles") {
        const chips = fetchProfessionalProfileChips(db);

        if (method === "GET" && !id) {
          json(
            res,
            200,
            fetchProfessionalProfilesAdmin(db).map((row) => mapProfessionalProfileApi(row, chips)),
          );
          return;
        }

        if (method === "POST" && !idSegment) {
          const parsed = professionalProfileInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          const newId = createProfessionalProfile(parsed.data);
          rebuildContentAndDumpSeed();
          json(res, 201, { ok: true, id: newId });
          return;
        }

        if (method === "POST" && idSegment === "reorder") {
          await handleReorder(req, res, reorderProfessionalProfiles);
          return;
        }

        if (id && method === "PATCH" && action !== "archive") {
          const parsed = professionalProfileInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => updateProfessionalProfile(id, parsed.data));
          json(res, 200, { ok: true });
          return;
        }

        if (id && method === "POST" && action === "archive") {
          const parsed = archiveInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => setProfessionalProfileArchived(id, parsed.data.archived));
          json(res, 200, { ok: true });
          return;
        }
      }

      if (resource === "experience") {
        if (method === "GET" && !id) {
          json(res, 200, fetchExperienceAdmin(db).map(mapExperienceApi));
          return;
        }

        if (method === "POST" && !idSegment) {
          const parsed = experienceInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          const newId = createExperience(parsed.data);
          rebuildContentAndDumpSeed();
          json(res, 201, { ok: true, id: newId });
          return;
        }

        if (method === "POST" && idSegment === "reorder") {
          await handleReorder(req, res, reorderExperience);
          return;
        }

        if (id && method === "PATCH") {
          const parsed = experienceInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => updateExperience(id, parsed.data));
          json(res, 200, { ok: true });
          return;
        }

        if (id && method === "POST" && action === "archive") {
          const parsed = archiveInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => setExperienceArchived(id, parsed.data.archived));
          json(res, 200, { ok: true });
          return;
        }
      }

      if (resource === "projects") {
        if (method === "GET" && !id) {
          json(res, 200, fetchProjectsAdmin(db).map(mapProjectApi));
          return;
        }

        if (method === "POST" && !idSegment) {
          const parsed = projectInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          ensureProjectImageUrlPublished(parsed.data.imageUrl);
          const newId = createProject(parsed.data);
          rebuildContentAndDumpSeed();
          json(res, 201, { ok: true, id: newId });
          return;
        }

        if (method === "POST" && idSegment === "reorder") {
          await handleReorder(req, res, reorderProjects);
          return;
        }

        if (id && method === "PATCH") {
          const parsed = projectInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          ensureProjectImageUrlPublished(parsed.data.imageUrl);
          mutateAndRebuild(() => updateProject(id, parsed.data));
          json(res, 200, { ok: true });
          return;
        }

        if (id && method === "POST" && action === "archive") {
          const parsed = archiveInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => setProjectArchived(id, parsed.data.archived));
          json(res, 200, { ok: true });
          return;
        }
      }

      if (resource === "github-repos") {
        if (method === "GET") {
          const repos = await listGithubReposForAdmin(fetchProjectsAdmin(db));
          json(res, 200, repos);
          return;
        }

        if (method === "POST" && idSegment === "import") {
          const parsed = githubRepoImportSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          const imported = importProjectFromGithub({
            owner: parsed.data.owner,
            repo: parsed.data.repo,
            title: parsed.data.title,
            description: parsed.data.description ?? "",
            url: parsed.data.url,
            privateRepo: parsed.data.privateRepo ?? false,
          });
          rebuildContentAndDumpSeed();

          const projects = fetchProjectsAdmin(db);
          const syncResult = await syncGithubProjectsFromDatabase(projects, {
            slugs: [imported.slug],
          });
          const projectReadmesPath = rebuildProjectReadmesFromDb();

          json(res, 201, {
            ok: true,
            id: imported.id,
            slug: imported.slug,
            readmeSynced: syncResult.synced > 0,
            ...syncResult,
            projectReadmesPath,
          });
          return;
        }
      }

      if (resource === "education") {
        if (method === "GET" && !id) {
          json(res, 200, fetchEducationAdmin(db).map(mapEducationApi));
          return;
        }

        if (method === "POST" && !idSegment) {
          const parsed = educationInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          const newId = createEducation(parsed.data);
          rebuildContentAndDumpSeed();
          json(res, 201, { ok: true, id: newId });
          return;
        }

        if (method === "POST" && idSegment === "reorder") {
          await handleReorder(req, res, reorderEducation);
          return;
        }

        if (id && method === "PATCH") {
          const parsed = educationInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => updateEducation(id, parsed.data));
          json(res, 200, { ok: true });
          return;
        }

        if (id && method === "POST" && action === "archive") {
          const parsed = archiveInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => setEducationArchived(id, parsed.data.archived));
          json(res, 200, { ok: true });
          return;
        }
      }

      if (resource === "certifications") {
        if (method === "GET" && !id) {
          json(res, 200, fetchCertificationsAdmin(db).map(mapCertificationApi));
          return;
        }

        if (method === "POST" && !idSegment) {
          const parsed = certificationInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          const newId = createCertification(parsed.data);
          rebuildContentAndDumpSeed();
          json(res, 201, { ok: true, id: newId });
          return;
        }

        if (method === "POST" && idSegment === "reorder") {
          await handleReorder(req, res, reorderCertifications);
          return;
        }

        if (id && method === "PATCH") {
          const parsed = certificationInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => updateCertification(id, parsed.data));
          json(res, 200, { ok: true });
          return;
        }

        if (id && method === "POST" && action === "archive") {
          const parsed = archiveInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => setCertificationArchived(id, parsed.data.archived));
          json(res, 200, { ok: true });
          return;
        }
      }

      if (resource === "skills") {
        if (method === "GET" && !id) {
          json(res, 200, fetchSkillsAdmin(db).map(mapSkillCategoryApi));
          return;
        }

        if (method === "POST" && !idSegment) {
          const parsed = skillCategoryInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          const newId = createSkillCategory(parsed.data);
          rebuildContentAndDumpSeed();
          json(res, 201, { ok: true, id: newId });
          return;
        }

        if (method === "POST" && idSegment === "reorder") {
          await handleReorder(req, res, reorderSkillCategories);
          return;
        }

        if (id && method === "PATCH") {
          const parsed = skillCategoryInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => updateSkillCategory(id, parsed.data));
          json(res, 200, { ok: true });
          return;
        }

        if (id && method === "POST" && action === "archive") {
          const parsed = archiveInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => setSkillCategoryArchived(id, parsed.data.archived));
          json(res, 200, { ok: true });
          return;
        }
      }

      if (resource === "articles") {
        if (method === "GET" && !id) {
          json(res, 200, fetchArticlesAdmin(db).map(mapArticleApi));
          return;
        }

        if (method === "POST" && !idSegment) {
          const parsed = articleInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          const newId = createArticle(parsed.data);
          rebuildContentAndDumpSeed();
          json(res, 201, { ok: true, id: newId });
          return;
        }

        if (method === "POST" && idSegment === "reorder") {
          await handleReorder(req, res, reorderArticles);
          return;
        }

        if (id && method === "PATCH") {
          const parsed = articleInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => updateArticle(id, parsed.data));
          json(res, 200, { ok: true });
          return;
        }

        if (id && method === "POST" && action === "archive") {
          const parsed = archiveInputSchema.safeParse(await parseJsonBody(req));
          if (!parsed.success) {
            json(res, 400, { error: formatZodError(parsed.error) });
            return;
          }
          mutateAndRebuild(() => setArticleArchived(id, parsed.data.archived));
          json(res, 200, { ok: true });
          return;
        }
      }
    } finally {
      db.close();
    }

    json(res, 404, { error: "Not found" });
  } catch (error) {
    json(res, 500, { error: errorMessage(error) });
  }
}
