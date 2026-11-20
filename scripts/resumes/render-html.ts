import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ProfileCvDocument, ResumeContact } from "../../src/content/types.js";
import { formatDateRange, formatExperienceDates, formatMonthYear } from "../lib/cv-mappers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEducationDates(start?: string, end?: string | null): string {
  if (!start && !end) return "";
  if (!start) return formatMonthYear(end as string);
  return formatDateRange(start, end ?? null);
}

function renderSkills(doc: ProfileCvDocument): string {
  return doc.skills
    .map(
      (group) => `
    <div class="skills-group">
      <strong>${escapeHtml(group.name)}:</strong>
      <span class="skills-list">${group.items.map(escapeHtml).join(", ")}</span>
    </div>`,
    )
    .join("");
}

function renderExperience(doc: ProfileCvDocument): string {
  return doc.experience
    .map((job) => {
      const bullets = job.highlights
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      const stack =
        job.tech.length > 0
          ? `<div class="experience-tech"><strong>Stack:</strong> ${job.tech.map(escapeHtml).join(", ")}</div>`
          : "";

      return `
    <article class="experience-item">
      <div class="experience-header">
        <div class="experience-role">${escapeHtml(job.role)}</div>
        <div class="experience-dates">${escapeHtml(formatExperienceDates(job))}</div>
      </div>
      <div class="experience-company">${escapeHtml(job.company)}${job.location ? ` · ${escapeHtml(job.location)}` : ""}</div>
      ${stack}
      ${bullets ? `<ul>${bullets}</ul>` : ""}
    </article>`;
    })
    .join("");
}

function renderProjects(doc: ProfileCvDocument): string {
  if (doc.projects.length === 0) return "";

  const items = doc.projects
    .map((project) => {
      const stack =
        project.tech.length > 0
          ? `<div class="project-tech"><strong>Stack:</strong> ${project.tech.map(escapeHtml).join(", ")}</div>`
          : "";
      return `
    <article class="project-item">
      <div class="project-title">${escapeHtml(project.title)}</div>
      <div class="project-desc">${escapeHtml(project.description)}</div>
      ${stack}
    </article>`;
    })
    .join("");

  return `
    <section class="section">
      <h2 class="section-title">Selected Projects</h2>
      ${items}
    </section>`;
}

function renderEducation(doc: ProfileCvDocument): string {
  return doc.education
    .slice(0, 3)
    .map((item) => {
      const dates = formatEducationDates(item.start, item.end);
      return `
    <div class="education-item">
      <div class="education-line">${escapeHtml(item.degree)} — ${escapeHtml(item.institution)}</div>
      <div class="education-meta">${[dates, item.location].filter((part): part is string => Boolean(part)).map(escapeHtml).join(" · ")}</div>
    </div>`;
    })
    .join("");
}

function renderCertifications(doc: ProfileCvDocument): string {
  return doc.certifications
    .slice(0, 4)
    .map((item) => {
      const date = item.issuedDate ? ` (${formatMonthYear(item.issuedDate)})` : "";
      return `
    <div class="cert-item">
      <div class="cert-line">${escapeHtml(item.name)}</div>
      <div class="cert-meta">${escapeHtml(item.issuer)}${escapeHtml(date)}</div>
    </div>`;
    })
    .join("");
}

export function renderResumeHtml(contact: ResumeContact, doc: ProfileCvDocument): string {
  const css = fs.readFileSync(path.join(__dirname, "resume.css"), "utf-8");
  const location = [contact.city, contact.country].filter(Boolean).join(", ");
  const contactParts = [
    `<span>${escapeHtml(contact.email)}</span>`,
    location ? `<span>${escapeHtml(location)}</span>` : "",
    contact.portfolioUrl
      ? `<span><a href="${escapeHtml(contact.portfolioUrl)}">${escapeHtml(
          contact.portfolioUrl.replace(/^https?:\/\//, ""),
        )}</a></span>`
      : "",
    contact.github ? `<span>${escapeHtml(contact.github)}</span>` : "",
    contact.linkedin ? `<span>${escapeHtml(contact.linkedin)}</span>` : "",
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="${escapeHtml(doc.locale)}">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(contact.name)} — ${escapeHtml(doc.targetRole)} Resume</title>
  <style>${css}</style>
</head>
<body>
  <main class="resume">
    <header class="header">
      <h1 class="name">${escapeHtml(contact.name)}</h1>
      <div class="headline">${escapeHtml(doc.headline)}</div>
      <div class="contact">${contactParts.join("")}</div>
    </header>

    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary">${escapeHtml(doc.summary)}</p>
    </section>

    <section class="section">
      <h2 class="section-title">Skills</h2>
      ${renderSkills(doc)}
    </section>

    <section class="section">
      <h2 class="section-title">Experience</h2>
      ${renderExperience(doc)}
    </section>
    ${renderProjects(doc)}

    <section class="section">
      <h2 class="section-title">Education</h2>
      ${renderEducation(doc)}
    </section>

    <section class="section">
      <h2 class="section-title">Certifications</h2>
      ${renderCertifications(doc)}
    </section>
  </main>
</body>
</html>`;
}
