import type {
  RecruitmentContent,
  RecruitmentField,
  RecruitmentPack,
  RecruitmentSection,
  SiteContent,
} from "../../src/content/types.js";
import type { ProfileCvRow } from "./cv-queries.js";
import type { ProfessionalProfileRow } from "./queries.js";

function formatDateRange(start: string, end: string | null): string {
  const fmt = (value: string) => {
    const [year, month] = value.split("-");
    if (!month) return year;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[Number(month) - 1]} ${year}`;
  };

  return `${fmt(start)} – ${end ? fmt(end) : "Present"}`;
}

function field(
  id: string,
  label: string,
  value: string,
  options?: { hint?: string; multiline?: boolean },
): RecruitmentField {
  return {
    id,
    label,
    value,
    ...(options?.hint ? { hint: options.hint } : {}),
    ...(options?.multiline ? { multiline: true } : {}),
  };
}

function section(
  id: string,
  label: string,
  fields: RecruitmentField[],
  description?: string,
): RecruitmentSection {
  return {
    id,
    label,
    ...(description ? { description } : {}),
    fields,
  };
}

function parseKeywords(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function joinBullets(items: string[]): string {
  return items.map((item) => `• ${item}`).join("\n");
}

function normalizeSkill(value: string): string {
  return value.trim().toLowerCase();
}

function uniqueSkills(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const group of groups) {
    for (const item of group) {
      const trimmed = item.trim();
      if (!trimmed) continue;

      const key = normalizeSkill(trimmed);
      if (seen.has(key)) continue;

      seen.add(key);
      result.push(trimmed);
    }
  }

  return result;
}

function formatSkillList(skills: string[], separator: ", " | "\n" = ", "): string {
  return skills.join(separator);
}

type ProfileSkillInventory = {
  primary: string[];
  upworkTop: string[];
  linkedinTop: string[];
  cvSkills: string[];
  experienceTech: string[];
  projectTech: string[];
  keywords: string[];
  siteByCategory: { name: string; items: string[] }[];
  masterList: string[];
};

function buildSkillInventory(
  site: SiteContent,
  profile: SiteContent["professionalProfiles"][number],
  cv: ProfileCvRow | undefined,
  cvSkillLabels: string[],
): ProfileSkillInventory {
  const keywords = parseKeywords(cv?.keywords ?? null);
  const experienceTech = uniqueSkills(site.experience.map((job) => job.tech).flat());
  const projectTech = uniqueSkills(site.projects.map((project) => project.tech).flat());
  const siteByCategory = site.skills
    .filter((group) => group.name.toLowerCase() !== "languages")
    .map((group) => ({
      name: group.name,
      items: uniqueSkills(group.items),
    }))
    .filter((group) => group.items.length > 0);

  const primary = uniqueSkills(
    profile.stack,
    profile.skills,
    cvSkillLabels,
    keywords,
    experienceTech,
    projectTech,
  );

  const siteSkills = uniqueSkills(...siteByCategory.map((group) => group.items));
  const masterList = uniqueSkills(primary, siteSkills);

  return {
    primary,
    upworkTop: primary.slice(0, 16),
    linkedinTop: masterList.slice(0, 50),
    cvSkills: uniqueSkills(cvSkillLabels),
    experienceTech,
    projectTech,
    keywords,
    siteByCategory,
    masterList,
  };
}

function buildUpworkSections(
  site: SiteContent,
  profile: SiteContent["professionalProfiles"][number],
  cv: ProfileCvRow | undefined,
  cvSkillLabels: string[],
): RecruitmentSection[] {
  const headline = cv?.headline ?? profile.title;
  const summary = cv?.summary ?? profile.description ?? profile.summary ?? site.pitch;
  const skills = buildSkillInventory(site, profile, cv, cvSkillLabels);
  const location = `${site.city}, ${site.country}`;

  const employmentSections = site.experience.slice(0, 6).map((job, index) => {
    const description = [
      job.summary,
      job.highlights.length ? joinBullets(job.highlights) : "",
      job.tech.length ? `Technologies: ${job.tech.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return section(
      `upwork-employment-${index + 1}`,
      `Employment ${index + 1}: ${job.role} @ ${job.company}`,
      [
        field("company", "Company", job.company),
        field("title", "Job title", job.role),
        field("dates", "Dates", formatDateRange(job.start, job.end)),
        field("city", "City", site.city),
        field("country", "Country", site.country),
        field(
          "description",
          "Description",
          description,
          { multiline: true, hint: "Paste into Upwork employment history." },
        ),
      ],
      job.location ? `Source location: ${job.location}` : undefined,
    );
  });

  const projectSections = site.projects.slice(0, 5).map((project, index) => {
    const links = project.links.map((link) => `${link.label ?? link.kind}: ${link.url}`).join("\n");
    const description = [
      project.description,
      project.tech.length ? `Technologies: ${project.tech.join(", ")}` : "",
      links ? links : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return section(
      `upwork-project-${index + 1}`,
      `Other experience ${index + 1}: ${project.title}`,
      [
        field("subject", "Subject", `Portfolio project: ${project.title}`),
        field(
          "description",
          "Description",
          description,
          { multiline: true, hint: "Maps to Upwork Other Experience (no portfolio write API)." },
        ),
      ],
    );
  });

  const educationText = site.education
    .slice(0, 4)
    .map((item) => {
      const dates = [item.start, item.end].filter(Boolean).join(" – ");
      const meta = [dates, item.location].filter(Boolean).join(" · ");
      return `${item.degree} — ${item.institution}${meta ? ` (${meta})` : ""}`;
    })
    .join("\n");

  const languages =
    site.skills.find((group) => group.name.toLowerCase() === "languages")?.items.join(", ") ??
    "Portuguese (Native), English (Professional working)";

  return [
    section("upwork-profile", "Profile basics", [
      field("title", "Professional title", headline, {
        hint: "Upwork profile title / specialized profile headline.",
      }),
      field(
        "overview",
        "Overview",
        [summary, "", profile.description ?? "", "", `Based in ${location}.`].filter(Boolean).join("\n"),
        { multiline: true, hint: "Upwork overview (edit manually — not writable via API)." },
      ),
      field("location", "Location", location),
      field("hourly-rate", "Hourly rate (USD)", "[Your target hourly rate]", {
        hint: "Fill before submitting proposals.",
      }),
      field("availability", "Hours per week", "30+ hours/week", {
        hint: "Adjust to your current availability.",
      }),
      field("work-preference", "Work preference", "Remote, open to async collaboration across time zones."),
    ]),
    section("upwork-skills", "Skills & categories", [
      field("skills-top-16", "Top 16 profile skills (Upwork limit)", formatSkillList(skills.upworkTop), {
        multiline: true,
        hint: "Paste the first 16 into Upwork. Reorder by relevance to this profile angle.",
      }),
      field(
        "skills-profile-extended",
        "Extended profile skills",
        formatSkillList(skills.primary, "\n"),
        {
          multiline: true,
          hint: `${skills.primary.length} skills from this profile angle, CV, experience, and projects.`,
        },
      ),
      field(
        "skills-experience-tech",
        "Skills from experience",
        formatSkillList(skills.experienceTech, "\n"),
        { multiline: true, hint: `${skills.experienceTech.length} technologies pulled from employment history.` },
      ),
      field(
        "skills-project-tech",
        "Skills from projects",
        formatSkillList(skills.projectTech, "\n"),
        { multiline: true, hint: `${skills.projectTech.length} technologies pulled from portfolio projects.` },
      ),
      ...skills.siteByCategory.map((group) =>
        field(
          `skills-site-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          `${group.name} (site catalog)`,
          formatSkillList(group.items, "\n"),
          {
            multiline: true,
            hint: `${group.items.length} skills from the portfolio skills database.`,
          },
        ),
      ),
      field(
        "skills-master-list",
        "Full deduplicated skill inventory",
        formatSkillList(skills.masterList, "\n"),
        {
          multiline: true,
          hint: `${skills.masterList.length} total unique skills across profile, experience, projects, and site catalog.`,
        },
      ),
      field("keywords", "ATS / search keywords", skills.keywords.join(", "), {
        multiline: true,
      }),
      field(
        "categories",
        "Suggested categories",
        profile.stack.join(", "),
        { hint: "Pick matching Upwork categories when creating specialized profiles." },
      ),
    ]),
    ...employmentSections,
    section("upwork-education", "Education", [
      field("education", "Education entries", educationText, { multiline: true }),
    ]),
    section("upwork-languages", "Languages", [
      field("languages", "Languages", languages, { multiline: true }),
    ]),
    ...projectSections,
    section("upwork-sync", "API sync notes", [
      field(
        "sync-command",
        "Sync employment & projects",
        "npm run sync:upwork -- --apply",
        { hint: "Local CLI only. Pushes experience + projects; overview/skills remain manual." },
      ),
      field(
        "sync-docs",
        "Writable via API",
        "Employment history and Other experience (projects).\nNot writable: overview, skills, specialized profiles, portfolio gallery.",
        { multiline: true },
      ),
    ]),
  ];
}

function buildLinkedInSections(
  site: SiteContent,
  profile: SiteContent["professionalProfiles"][number],
  cv: ProfileCvRow | undefined,
  cvSkillLabels: string[],
): RecruitmentSection[] {
  const headline = cv?.headline ?? profile.title;
  const summary = cv?.summary ?? profile.description ?? profile.summary ?? site.pitch;
  const skills = buildSkillInventory(site, profile, cv, cvSkillLabels);
  const aboutSkillSummary = [
    `Core stack: ${profile.stack.join(", ")}.`,
    `Profile skills: ${profile.skills.join(", ")}.`,
    skills.cvSkills.length ? `CV highlights: ${skills.cvSkills.join(", ")}.` : "",
    `Broader expertise includes ${skills.primary.slice(16, 36).join(", ")}.`,
  ]
    .filter(Boolean)
    .join("\n");
  const about = [
    summary,
    "",
    profile.description ?? "",
    "",
    ...site.aboutParagraphs.slice(0, 2),
    "",
    aboutSkillSummary,
    "",
    `📍 ${site.city}, ${site.country}`,
    site.links.linkedin ? `🔗 ${site.links.linkedin}` : "",
    site.links.github ? `💻 ${site.links.github}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const experienceSections = site.experience.slice(0, 6).map((job, index) => {
    const description = [
      job.summary,
      job.highlights.length ? joinBullets(job.highlights) : "",
      job.tech.length ? `Skills: ${job.tech.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return section(
      `linkedin-experience-${index + 1}`,
      `Experience ${index + 1}: ${job.role}`,
      [
        field("title", "Title", job.role),
        field("company", "Company", job.company),
        field("dates", "Dates", formatDateRange(job.start, job.end)),
        field("location", "Location", job.location ?? `${site.city}, ${site.country}`),
        field("description", "Description", description, { multiline: true }),
      ],
    );
  });

  const linkedinOverflow = skills.masterList.slice(50);
  const educationText = site.education
    .map((item) => {
      const dates = [item.start, item.end].filter(Boolean).join(" – ");
      return `${item.institution} — ${item.degree}${dates ? ` (${dates})` : ""}`;
    })
    .join("\n");

  const certificationsText = site.certifications
    .slice(0, 8)
    .map((cert) => `${cert.name} — ${cert.issuer}${cert.issuedDate ? ` (${cert.issuedDate})` : ""}`)
    .join("\n");

  return [
    section("linkedin-headline", "Headline & open to work", [
      field("headline", "Headline", headline, {
        hint: "LinkedIn limit: 220 characters.",
      }),
      field(
        "open-to-work",
        "Open to work — job titles",
        cv?.target_role ?? profile.title,
        { hint: "Add target titles in LinkedIn Open to Work preferences." },
      ),
      field(
        "featured-headline",
        "Featured section title",
        `Resume — ${profile.title}`,
        { hint: "Use for featured resume PDF or portfolio link." },
      ),
    ]),
    section("linkedin-about", "About", [
      field("about", "About section", about, {
        multiline: true,
        hint: "LinkedIn About allows ~2,600 characters. Trim if needed.",
      }),
    ]),
    section("linkedin-skills", "Skills", [
      field("top-skills", "Skills to pin (top 50)", formatSkillList(skills.linkedinTop, "\n"), {
        multiline: true,
        hint: "LinkedIn allows up to 50 pinned skills. List uses the full ranked inventory.",
      }),
      field(
        "additional-skills",
        "Additional skills pool",
        formatSkillList(linkedinOverflow, "\n"),
        {
          multiline: true,
          hint:
            linkedinOverflow.length > 0
              ? `${linkedinOverflow.length} more skills beyond the top 50 — add manually or swap lower-priority pins.`
              : "All catalog skills already fit within the top 50.",
        },
      ),
      field(
        "skills-by-category",
        "Site catalog by category",
        skills.siteByCategory
          .map((group) => `${group.name} (${group.items.length})\n${formatSkillList(group.items, "\n")}`)
          .join("\n\n"),
        {
          multiline: true,
          hint: "Full grouped inventory from the portfolio skills database.",
        },
      ),
      field(
        "skills-master-list",
        "Full deduplicated inventory",
        formatSkillList(skills.masterList, "\n"),
        {
          multiline: true,
          hint: `${skills.masterList.length} unique skills across all sources.`,
        },
      ),
    ]),
    ...experienceSections,
    section("linkedin-education", "Education", [
      field("education", "Education", educationText, { multiline: true }),
    ]),
    section("linkedin-certifications", "Licenses & certifications", [
      field("certifications", "Certifications", certificationsText, { multiline: true }),
    ]),
    section("linkedin-contact", "Contact & links", [
      field("custom-url", "Custom URL", "linkedin.com/in/your-username"),
      field("website", "Website / portfolio", "https://[your-vercel-domain]"),
      field("resume-link", "Resume download", profile.resumeUrl, {
        hint: "Host PDF or link to portfolio resume section.",
      }),
      field(
        "creator-mode",
        "Creator mode — featured link label",
        "View my portfolio",
      ),
    ]),
  ];
}

function buildGeneralSections(
  site: SiteContent,
  profile: SiteContent["professionalProfiles"][number],
  cv: ProfileCvRow | undefined,
  cvSkillLabels: string[],
): RecruitmentSection[] {
  const targetRole = cv?.target_role ?? profile.title;
  const summary = cv?.summary ?? profile.description ?? profile.summary ?? site.pitch;
  const skills = buildSkillInventory(site, profile, cv, cvSkillLabels);
  const recentCompanies = site.experience
    .slice(0, 3)
    .map((job) => job.company)
    .join(", ");
  const topAchievement =
    site.experience[0]?.highlights[0] ??
    "Built AI-driven products that reduced production time from hours to seconds while improving reliability and user engagement.";

  const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${targetRole} opportunity at [Company Name]. ${summary.split(".")[0]}.

In my recent work at ${recentCompanies}, I have delivered measurable impact across engineering, product, and AI initiatives — including ${topAchievement.toLowerCase().replace(/\.$/, "")}. I am confident my background aligns with the technical and collaborative demands of this role.

I am based in ${site.city}, ${site.country} (UTC−3) and am comfortable working remotely with distributed teams. I would welcome the chance to discuss how my experience with ${skills.primary.slice(0, 8).join(", ")} can support your goals.

Thank you for your time and consideration.

Best regards,
${site.name}
${site.email}
${site.links.linkedin ?? ""}`;

  const elevatorPitch = `I'm ${site.name}, a ${targetRole} based in ${site.city}, ${site.country}. ${profile.summary ?? site.pitch} Recent highlights include work at ${recentCompanies}.`;

  return [
    section("general-cover", "Cover letter", [
      field("cover-letter", "Cover letter template", coverLetter, {
        multiline: true,
        hint: "Replace [Company Name] and tailor the middle paragraph per application.",
      }),
      field("elevator-pitch", "Elevator pitch (30 seconds)", elevatorPitch, { multiline: true }),
      field(
        "why-company",
        "Why this company?",
        `I am interested in [Company Name] because [specific product/mission fit]. My experience in ${skills.primary.slice(0, 10).join(", ")} maps directly to [team goal or job requirement], and I am excited to contribute to [concrete outcome].`,
        { multiline: true },
      ),
    ]),
    section("general-compensation", "Compensation & availability", [
      field("salary-expectation", "Salary expectation", "[Target range in local currency or USD — e.g. R$ X–Y/month or $X–Y/year]"),
      field("hourly-rate", "Contract / hourly rate", "[USD/hour for contract roles]"),
      field("notice-period", "Notice period", "Immediate / 2 weeks / [custom]"),
      field("start-date", "Earliest start date", "[Date or 'Immediate']"),
      field("hours-per-week", "Availability (hours/week)", "40 hours/week (full-time) or [part-time hours]"),
    ]),
    section("general-logistics", "Work logistics", [
      field("work-authorization", "Work authorization", `Based in ${site.country}. [Add visa/work permit status if relevant.]`, { multiline: true }),
      field("remote-preference", "Remote / hybrid / onsite", "Remote-first; open to hybrid in Your City or occasional travel."),
      field("timezone", "Timezone", "America/YourCity (UTC−3)"),
      field("relocation", "Willing to relocate?", "Not required for remote roles; open to discussion for the right opportunity."),
    ]),
    section("general-interview", "Common interview answers", [
      field(
        "greatest-achievement",
        "Greatest professional achievement",
        topAchievement,
        { multiline: true },
      ),
      field(
        "challenge-overcome",
        "Tell me about a challenge you overcame",
        `At ${site.experience[0]?.company ?? "my current role"}, I tackled [complex technical/product challenge] by [approach]. The result was [measurable outcome — latency, revenue, retention, etc.].`,
        { multiline: true },
      ),
      field(
        "leadership-example",
        "Leadership / ownership example",
        `As ${site.experience.find((job) => job.role.toLowerCase().includes("founder") || job.role.toLowerCase().includes("lead"))?.role ?? "a senior contributor"}, I led [initiative] across [team/stakeholders], aligning engineering delivery with business goals and shipping [outcome].`,
        { multiline: true },
      ),
      field(
        "why-leaving",
        "Why are you looking for a new role?",
        `I am seeking a ${targetRole} role where I can focus on [growth area — e.g. production LLM systems, scale, impact] and contribute to a team building [type of product].`,
        { multiline: true },
      ),
      field(
        "strengths",
        "Key strengths",
        formatSkillList(skills.primary.slice(0, 20), "\n"),
        { multiline: true, hint: "Top 20 ranked skills for this profile angle." },
      ),
      field(
        "technical-skills",
        "Technical skills inventory",
        formatSkillList(
          skills.siteByCategory.find((group) => group.name === "Technical Skills")?.items ??
            skills.experienceTech,
          "\n",
        ),
        { multiline: true },
      ),
      field(
        "soft-skills",
        "Soft skills inventory",
        formatSkillList(
          skills.siteByCategory.find((group) => group.name === "Soft Skills")?.items ?? [],
          "\n",
        ),
        { multiline: true },
      ),
      field(
        "all-skills",
        "Complete skill inventory",
        formatSkillList(skills.masterList, "\n"),
        {
          multiline: true,
          hint: `${skills.masterList.length} unique skills for applications that ask for a full list.`,
        },
      ),
      field(
        "weaknesses",
        "Area for growth (weakness framing)",
        "I sometimes dive deep into technical optimization; I balance this by time-boxing spikes and validating impact with stakeholders early.",
        { multiline: true },
      ),
    ]),
    section("general-references", "References & links", [
      field("portfolio", "Portfolio URL", "http://localhost:5173/ (local) / [production URL]"),
      field("github", "GitHub", site.links.github ?? ""),
      field("linkedin", "LinkedIn", site.links.linkedin ?? ""),
      field("resume", "Resume PDF", profile.resumeUrl),
      field("email", "Email", site.email),
      field("references", "References", "Available upon request."),
    ]),
  ];
}

export function buildRecruitmentContent(
  site: SiteContent,
  profiles: ProfessionalProfileRow[],
  cvRows: ProfileCvRow[],
  cvSkillRows: { profile_id: number; label: string }[],
): RecruitmentContent {
  const cvByProfileId = new Map(cvRows.map((row) => [row.profile_id, row]));
  const cvSkillsByProfileId = new Map<number, string[]>();

  for (const row of cvSkillRows) {
    const list = cvSkillsByProfileId.get(row.profile_id) ?? [];
    list.push(row.label);
    cvSkillsByProfileId.set(row.profile_id, list);
  }

  const packs: RecruitmentPack[] = profiles
    .map((row) => {
      const profile = site.professionalProfiles.find((item) => item.slug === row.slug);
      if (!profile) return null;

      const cv = cvByProfileId.get(row.id);
      const cvSkillLabels = uniqueSkills(cvSkillsByProfileId.get(row.id) ?? []);

      return {
        slug: profile.slug,
        title: profile.title,
        targetRole: cv?.target_role ?? profile.title,
        resumeUrl: profile.resumeUrl,
        upwork: buildUpworkSections(site, profile, cv, cvSkillLabels),
        linkedin: buildLinkedInSections(site, profile, cv, cvSkillLabels),
        general: buildGeneralSections(site, profile, cv, cvSkillLabels),
      };
    })
    .filter((pack): pack is RecruitmentPack => pack !== null);

  return { packs };
}
