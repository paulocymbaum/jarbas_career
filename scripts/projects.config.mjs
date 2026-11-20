/**
 * Portfolio project definitions synced from GitHub.
 * Run: npm run sync:github-projects
 */

/** @typedef {{ kind: 'github' | 'demo' | 'case_study' | 'other'; url: string; label?: string }} ProjectLinkConfig */

/** @typedef {{ slug: string; owner?: string; repo: string; title: string; description: string; featured: boolean; privateRepo?: boolean; stealth?: boolean; openTag?: boolean; links?: ProjectLinkConfig[]; gradient: string; tech: string[] }} PortfolioProject */

export const GITHUB_OWNER_PERSONAL = "your-username";
export const GITHUB_OWNER_YourCompany = "your-org";

export function projectGithubUrl(project) {
  const owner = project.owner ?? GITHUB_OWNER_PERSONAL;
  return `https://github.com/${owner}/${project.repo}`;
}

/** @type {PortfolioProject[]} */
export const portfolioProjects = [
  {
    slug: "praxis",
    repo: "praxis",
    title: "Praxis",
    description:
      "Open-source educational harness and interactive UI for self-directed coding mastery through project-based learning with AI tutoring.",
    featured: true,
    openTag: true,
    links: [
      {
        kind: "demo",
        url: "https://ed-harness-landing-page.vercel.app/",
        label: "Open",
      },
    ],
    gradient: "from-emerald-950 via-emerald-600 to-teal-300",
    tech: ["TypeScript", "React", "Vite", "EdTech", "LangGraph"],
  },
  {
    slug: "ed-tech-system-mcp",
    repo: "ed-tech-system-mcp",
    title: "Ed-Tech System MCP",
    description:
      "Domain-driven MCP server for ed-tech workflows with LangGraph agents, Supabase retrieval, and YouTube discovery.",
    featured: true,
    openTag: true,
    gradient: "from-violet-950 via-violet-600 to-indigo-300",
    tech: ["Python", "MCP", "LangGraph", "Supabase", "FastAPI"],
  },
  {
    slug: "prompt-to-app-product-investigator",
    repo: "prompt-to-app-product-investigator",
    title: "Prompt-to-App Product Investigator",
    description:
      "Conversational AI that investigates product ideas through interactive questioning and generates implementation-ready prompts.",
    featured: true,
    gradient: "from-indigo-950 via-indigo-600 to-indigo-300",
    tech: ["Python", "Groq", "RAG", "LLMs"],
  },
  {
    slug: "ai-code-editor",
    repo: "AI_code_editor",
    title: "AI Code Editor",
    description:
      "Production-ready AI coding agent powered by Groq, specialized in React/TypeScript generation with 42 modular tools.",
    featured: false,
    gradient: "from-rose-950 via-rose-600 to-orange-400",
    tech: ["Python", "Groq", "React", "TypeScript"],
  },
  {
    slug: "portfolio-cv",
    repo: "portfolio-cv",
    title: "Portfolio CV",
    description:
      "This portfolio site — SQLite-backed content pipeline, ATS resume PDFs, and a static React/Vite frontend.",
    featured: false,
    privateRepo: true,
    gradient: "from-sky-950 via-sky-600 to-cyan-300",
    tech: ["TypeScript", "React", "SQLite", "Playwright"],
  },
  {
    slug: "job-search-assistant",
    repo: "job-search-assistant",
    title: "Job Search Assistant",
    description:
      "Monorepo job search agent with Clean Architecture modules, React web app, and BFF placeholder.",
    featured: false,
    privateRepo: true,
    gradient: "from-amber-950 via-amber-600 to-yellow-300",
    tech: ["TypeScript", "React", "Vite", "Supabase"],
  },
  {
    slug: "ed-tech-system",
    repo: "ed-tech-system",
    title: "Ed-Tech System",
    description:
      "Educational harness and interactive UI for self-directed coding mastery with validated curriculum and AI project correction.",
    featured: false,
    privateRepo: true,
    gradient: "from-fuchsia-950 via-fuchsia-600 to-pink-300",
    tech: ["TypeScript", "React", "EdTech", "PBL"],
  },
  {
    slug: "ai-chatbot-ui",
    repo: "AIChatBot_ui",
    title: "AI ChatBot UI",
    description:
      "Production-ready React + TypeScript boilerplate with Clean Architecture, security validations, and pre-commit hooks.",
    featured: false,
    gradient: "from-slate-800 via-blue-600 to-blue-300",
    tech: ["React", "TypeScript", "Vite", "Zustand"],
  },
  {
    slug: "ai-agent-system-template",
    repo: "ai_agent_system_template",
    title: "AI Agent System Template",
    description:
      "Reusable template for building multi-agent AI systems with structured workflows and tool integration.",
    featured: false,
    gradient: "from-violet-900 via-purple-600 to-fuchsia-400",
    tech: ["Python", "LangChain", "AI Agents"],
  },
  {
    slug: "react-project-template",
    repo: "react-project-template",
    title: "React Project Template",
    description:
      "Opinionated React project starter with Clean Architecture, automated validation, and quality checks.",
    featured: false,
    gradient: "from-slate-900 via-slate-600 to-slate-300",
    tech: ["React", "TypeScript", "Vite"],
  },
  {
    slug: "your-project",
    owner: GITHUB_OWNER_YourCompany,
    repo: "your-repo",
    title: "YourCompany Lesson Generator",
    description:
      "AI-powered REST API for generating structured CEFR-compliant English lessons with theory, practice, and quizzes — powered by Groq and FastAPI.",
    featured: true,
    privateRepo: true,
    gradient: "from-orange-950 via-orange-600 to-amber-300",
    tech: ["Python", "FastAPI", "Groq", "CEFR", "EdTech"],
  },
  {
    slug: "your",
    owner: GITHUB_OWNER_YourCompany,
    repo: "YourCompany",
    title: "YourCompany",
    description:
      "AI-powered EdTech SaaS for English teachers — personalized learning paths, lesson automation, and FlutterFlow mobile delivery.",
    featured: true,
    privateRepo: true,
    gradient: "from-cyan-950 via-cyan-600 to-sky-300",
    tech: ["Flutter", "FlutterFlow", "Dart", "EdTech", "SaaS"],
  },
  {
    slug: "your-repo-v2",
    owner: GITHUB_OWNER_YourCompany,
    repo: "YourCompany-v2",
    title: "YourCompany v2",
    description:
      "Rebuilt YourCompany EdTech platform — new architecture and refreshed product experience for English teachers and learners.",
    featured: false,
    privateRepo: true,
    gradient: "from-teal-950 via-teal-600 to-emerald-300",
    tech: ["EdTech", "SaaS", "FlutterFlow"],
  },
  {
    slug: "pixelanea",
    repo: "pixelanea",
    title: "pixelanea",
    description:
      "Local-only pixel art editor — draw, animate, and save .pixelanea projects without the cloud.",
    featured: true,
    gradient: "from-slate-900 via-slate-600 to-slate-300",
    tech: ["C++", "ReactJS", "Fullstack", "Desktop (Linux) + Web App"],
  },
  {
    slug: "gmail-monitor-organizer",
    repo: "gmail-monitor-organizer",
    title: "Gmail Monitor & Organizer",
    description:
      "Hybrid Gmail classifier on Google Apps Script — rules, decision tree, and Gemini embeddings fallback that label mail into 14 categories, validated on 788 synthetic samples with 100% accuracy.",
    featured: true,
    openTag: true,
    gradient: "from-zinc-900 via-teal-600 to-cyan-300",
    tech: ["JavaScript", "Google Apps Script", "Gmail API", "Gemini Embeddings", "Decision Trees", "Classification Model", "Model Optimization"],
  },
  {
    slug: "stealth-startup",
    repo: "stealth-startup",
    title: "Stealth Startup",
    description:
      "Stealth startup (NDA): geolocated 2026 election data pipelines (ETL on Docker and Kubernetes), an agent-and-RAG creator platform (LangGraph, Qdrant), multi-tenant restaurant menu ingestion from HTML, PDF, PNG, or QR codes, and real-time bus tracking. Built the Jira-integrated SDLC harness driving an agentic, AI-augmented coding workflow across a functional monorepo — backend, frontend, and platform layers — with AI architecture and quality gates for system design, test coverage, cost calculation, lint, and vulnerability security scans. Stack: Flutter, React, C#, Python.",
    featured: true,
    privateRepo: true,
    stealth: true,
    gradient: "from-fuchsia-950 via-purple-600 to-indigo-300",
    tech: ["ETL", "Kubernetes", "Docker", "PostgreSQL", "SQLite", "RAG", "LangGraph", "Qdrant", "Flutter", "React", "C#", "Python"],
  },
];

export function buildProjectsSeedSql(esc) {
  const values = portfolioProjects
    .map(
      (project, index) =>
        `  (${index + 1}, '${esc(project.title)}', '${esc(project.slug)}', '${esc(project.description)}', '${esc(project.gradient)}', ${project.featured ? 1 : 0}, ${project.privateRepo ? 1 : 0}, ${index})`,
    )
    .join(",\n");

  const linkRows = [];
  portfolioProjects.forEach((project, index) => {
    const projectId = index + 1;
    if (!project.stealth) {
      linkRows.push(
        `  (${projectId}, 'github', '${esc(projectGithubUrl(project))}', 0, NULL)`,
      );
    }

    for (const [sortOrder, link] of (project.links ?? []).entries()) {
      linkRows.push(
        `  (${projectId}, '${esc(link.kind)}', '${esc(link.url)}', ${sortOrder + 1}, ${link.label ? `'${esc(link.label)}'` : "NULL"})`,
      );
    }
  });

  const techRows = [];
  portfolioProjects.forEach((project, index) => {
    project.tech.forEach((label, sortOrder) => {
      techRows.push(`  (${index + 1}, '${esc(label)}', ${sortOrder})`);
    });
  });

  return `INSERT INTO project (id, title, slug, description, gradient, featured, private_repo, sort_order) VALUES
${values};

INSERT INTO project_link (project_id, kind, url, sort_order, label) VALUES
${linkRows.join(",\n")};

INSERT INTO project_tech (project_id, label, sort_order) VALUES
${techRows.join(",\n")};`;
}
