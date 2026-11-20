import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { chromium } from "playwright";
import { mapProfileCvDocuments, mapResumeContact } from "./lib/cv-mappers.js";
import {
  fetchProfileCvExperienceRows,
  fetchProfileCvHighlightRows,
  fetchProfileCvProjectRows,
  fetchProfileCvRows,
  fetchProfileCvSkillRows,
  fetchProfilesWithCv,
  syncProfileResumeUrl,
  updateProfileCvMetadata,
} from "./lib/cv-queries.js";
import { getProjectRoot, openDatabaseReadWrite } from "./lib/db.js";
import {
  fetchCertifications,
  fetchEducation,
  fetchExperience,
  fetchProjects,
  fetchSiteProfile,
} from "./lib/queries.js";
import { renderResumeHtml } from "./resumes/render-html.js";
import { getResumePdfFilename, getResumePublicPath } from "../src/lib/resume-filename.ts";
import { validateProfileCvDocuments } from "./lib/validate.js";

const MAX_PAGES = 2;

async function countPdfPages(buffer: Buffer): Promise<number> {
  const pdf = await PDFDocument.load(buffer);
  return pdf.getPageCount();
}

async function main(): Promise<void> {
  const root = getProjectRoot();
  const outputDir = path.join(root, "public", "resumes");
  fs.mkdirSync(outputDir, { recursive: true });

  const db = openDatabaseReadWrite();

  try {
    const siteProfile = fetchSiteProfile(db);
    if (!siteProfile) {
      throw new Error("site_profile está vazio. Execute: npm run db:reset");
    }

    const contact = mapResumeContact(siteProfile);

    const documents = mapProfileCvDocuments({
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

    if (documents.length === 0) {
      throw new Error("Nenhum CV de perfil encontrado. Execute: npm run db:reset");
    }

    validateProfileCvDocuments(documents);

    const browser = await chromium.launch({ headless: true });
    const generatedAt = new Date().toISOString();

    try {
      for (const doc of documents) {
        const html = renderResumeHtml(contact, doc);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle" });

        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
          margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
        });
        await page.close();

        const pageCount = await countPdfPages(Buffer.from(pdfBuffer));
        if (pageCount > MAX_PAGES) {
          throw new Error(
            `Resume "${doc.slug}" has ${pageCount} pages (max ${MAX_PAGES}). Trim content in scripts/resumes/profile-scopes.mjs`,
          );
        }

        const filename = getResumePdfFilename(doc.slug);
        const outputPath = path.join(outputDir, filename);
        fs.writeFileSync(outputPath, pdfBuffer);

        const pdfPath = getResumePublicPath(doc.slug);
        const profileRow = fetchProfilesWithCv(db).find((row) => row.slug === doc.slug);
        if (profileRow) {
          updateProfileCvMetadata(db, profileRow.id, pageCount, generatedAt);
          syncProfileResumeUrl(db, profileRow.id, pdfPath);
        }

        console.info(`Generated ${pdfPath} (${pageCount} page${pageCount === 1 ? "" : "s"})`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    db.close();
  }
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
