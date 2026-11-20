// Shared loader for SEO/ATS audits and threshold tests.
// Reads the SQLite database through the same query + mapper functions the build
// pipeline uses, so scores always reflect exactly what gets built and shipped.

import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import type { ProfileCvDocument, SiteContent } from "../../src/content/types.js";
import { getProjectRoot, openDatabaseReadonly } from "./db.js";
import { mapSiteContent } from "./mappers.js";
import { mapProfileCvDocuments } from "./cv-mappers.js";
import {
  fetchArticles,
  fetchCertifications,
  fetchEducation,
  fetchExperience,
  fetchProfessionalProfileChips,
  fetchProfessionalProfiles,
  fetchProjects,
  fetchSiteProfile,
  fetchSkills,
} from "./queries.js";
import {
  fetchProfileCvExperienceRows,
  fetchProfileCvHighlightRows,
  fetchProfileCvProjectRows,
  fetchProfileCvRows,
  fetchProfileCvSkillRows,
  fetchProfilesWithCv,
} from "./cv-queries.js";
import { validateSiteContent } from "./validate.js";

export type AuditInput = {
  site: SiteContent;
  documents: ProfileCvDocument[];
  indexHtml: string;
  freelanceHtml: string;
};

export function loadIndexHtml(): string {
  const root = getProjectRoot();
  const indexPath = path.join(root, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`index.html não encontrado em ${indexPath}`);
  }
  return fs.readFileSync(indexPath, "utf-8");
}

export function loadFreelanceHtml(): string {
  const root = getProjectRoot();
  const freelancePath = path.join(root, "freelance.html");
  if (!fs.existsSync(freelancePath)) {
    throw new Error(`freelance.html não encontrado em ${freelancePath}`);
  }
  return fs.readFileSync(freelancePath, "utf-8");
}

export function loadSiteContent(db: Database.Database): SiteContent {
  const profile = fetchSiteProfile(db);
  if (!profile) {
    throw new Error("site_profile está vazio. Execute: npm run db:reset");
  }

  const rawContent = mapSiteContent({
    profile,
    professionalProfiles: fetchProfessionalProfiles(db),
    professionalProfileChips: fetchProfessionalProfileChips(db),
    experience: fetchExperience(db),
    projects: fetchProjects(db),
    education: fetchEducation(db),
    certifications: fetchCertifications(db),
    skills: fetchSkills(db),
    articles: fetchArticles(db),
  });

  return validateSiteContent(rawContent);
}

export function loadProfileCvDocuments(db: Database.Database): ProfileCvDocument[] {
  return mapProfileCvDocuments({
    profiles: fetchProfilesWithCv(db),
    cvRows: fetchProfileCvRows(db),
    cvExperience: fetchProfileCvExperienceRows(db),
    cvHighlights: fetchProfileCvHighlightRows(db),
    cvSkills: fetchProfileCvSkillRows(db),
    cvProjects: fetchProfileCvProjectRows(db),
    canonicalExperience: fetchExperience(db),
    projects: fetchProjects(db),
    education: fetchEducation(db),
    certifications: fetchCertifications(db),
  });
}

/** Load everything the audit needs. Opens the database readonly and closes it. */
export function loadAuditInput(): AuditInput {
  const db = openDatabaseReadonly();
  try {
    return {
      site: loadSiteContent(db),
      documents: loadProfileCvDocuments(db),
      indexHtml: loadIndexHtml(),
      freelanceHtml: loadFreelanceHtml(),
    };
  } finally {
    db.close();
  }
}
