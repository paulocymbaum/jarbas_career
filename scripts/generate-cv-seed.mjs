/**
 * Generate db/seed.sql from Your Name's official CV (PDF export).
 * Source: Your Name_Your_Your-CV.pdf (issued 27/07/2026)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

import { buildCvSeedSql } from "./resumes/profile-scopes.mjs";
import { getResumePublicPath } from "./lib/resume-filename.mjs";

const esc = (s) => String(s).replace(/'/g, "''");

const profile = `INSERT INTO site_profile (
  id, name, title, pitch, about_paragraphs, photo_url, email, city, country,
  github_url, linkedin_url, footer_note
) VALUES (
  1,
  'Your Name',
  'AI Engineer · Full-Stack · LLMOps',
  'AI Engineer building scalable EdTech products with LLMs, RAG, and AI-augmented engineering.',
  '["I am an AI Engineer with over a decade of experience shipping applied AI products. My work revolves around optimizing large language models (LLMs), developing Retrieval-Augmented Generation (RAG) architectures, and integrating AI-driven automation into scalable applications for education. I am passionate about leveraging AI to solve real-world problems, with a particular focus on emerging markets, AI agents, and intelligent automation.","I specialize in Python, TypeScript, JavaScript, Dart, and Flutter, with extensive experience in LangChain, Langflow, CrewAI, and AI agents. As Founder & Lead Developer at YourCompany, I built AI-driven lesson creation pipelines that cut production time from hours to seconds. At YourCompany and YourClient, I lead AI-augmented frontend engineering with React, Flutter, and Cursor.","Beyond development, I have a strong background in business strategy, AI-driven market research, and customer engagement. At my private training business, I implemented data-driven engagement strategies that reduced user churn by 50%. I hold a degree in Automation and Control Engineering and diplomas in Business, Management, and Project Management.","Open to AI Engineering opportunities where I can contribute to cutting-edge projects in LLMs, NLP, RAG architectures, and AI automation. Based in Your City, Brazil (UTC−3)."]',
  '/images/your-slug.webp',
  'you@example.com',
  'Your City',
  'Brazil',
  'https://github.com/your-username',
  'https://www.linkedin.com/in/your-username/',
  'Built with React, shadcn/ui, and anime.js.'
);`;

const professionalProfiles = [
  {
    id: 1,
    title: "AI Engineer",
    slug: "ai-engineer",
    summary: "LLM integrations, RAG, agentic AI, and production-ready AI workflows.",
    description:
      "Design and ship production AI systems — from RAG pipelines and LLM routing to evaluation harnesses and backend systems. Experienced integrating LangChain, GroqCloud, and LangSmith in products, with a focus on structured outputs, latency optimization, and reliable fallbacks.",
    accent: "from-violet-700 via-purple-500 to-fuchsia-400",
    resumeUrl: getResumePublicPath("ai-engineer"),
    stack: ["Python", "LangChain", "RAG", "Supabase"],
    skills: [
      "LLMOps",
      "Prompt Engineering",
      "AI Agents",
      "GroqCloud",
      "LangSmith",
      "GenAI",
      "Fine-Tuning Models",
      "Agentic RAG",
      "NLP",
      "Responsible AI",
    ],
  },
  {
    id: 2,
    title: "Fullstack Engineer",
    slug: "fullstack-engineer",
    summary: "End-to-end delivery across React, TypeScript, Flutter, and PostgreSQL.",
    description:
      "Build full-stack features from API integration to polished UIs — spanning React and TypeScript at YourCompany and Flutter/Dart on HR ERP products via YourClient. Focus on test automation, design systems, agent harnesses, and CI/CD pipelines that help teams ship with confidence.",
    accent: "from-blue-600 via-blue-500 to-cyan-400",
    resumeUrl: getResumePublicPath("fullstack-engineer"),
    stack: ["TypeScript", "React", "Flutter", "PostgreSQL"],
    skills: [
      "Cursor",
      "CI/CD",
      "Test Automation",
      "Design System",
      "API Integration",
      "JavaScript",
      "Full-Stack Development",
      "DevOps",
      "Supabase",
      "REST/GraphQL APIs",
      "Unit & Integration Testing",
      "Web Development",
    ],
  },
  {
    id: 3,
    title: "Product Engineer",
    slug: "product-engineer",
    summary: "EdTech co-founder — product strategy, SaaS, and learning experience design.",
    description:
      "Bridge product and engineering as a founder — defining roadmaps, measuring business metrics, and shipping user-facing features fast. At YourCompany I owned go-to-market, CRM analytics, and low-code delivery with FlutterFlow, turning teacher workflows into scalable SaaS experiences.",
    accent: "from-emerald-700 via-teal-500 to-lime-400",
    resumeUrl: getResumePublicPath("product-engineer"),
    stack: ["FlutterFlow", "Next.js", "TypeScript", "Analytics"],
    skills: [
      "Product Strategy",
      "EdTech",
      "SaaS",
      "CRM",
      "Go-to-Market",
      "Product Discovery",
      "Product Management",
      "User Research",
      "Gamification",
      "Business Metrics",
      "Learning Experience Design",
    ],
  },
];

function buildProfProfilesSql() {
  let sql =
    "INSERT INTO professional_profile (id, title, slug, summary, description, accent, resume_url, sort_order) VALUES\n";
  sql +=
    professionalProfiles
      .map(
        (p, i) =>
          `  (${p.id}, '${esc(p.title)}', '${esc(p.slug)}', '${esc(p.summary)}', '${esc(p.description)}', '${esc(p.accent)}', '${esc(p.resumeUrl)}', ${i})`,
      )
      .join(",\n") + ";\n\n";

  sql += "INSERT INTO professional_profile_chip (profile_id, label, kind, sort_order) VALUES\n";
  const chips = [];
  for (const profile of professionalProfiles) {
    profile.stack.forEach((label, i) =>
      chips.push(`  (${profile.id}, '${esc(label)}', 'stack', ${i})`),
    );
    profile.skills.forEach((label, i) =>
      chips.push(`  (${profile.id}, '${esc(label)}', 'skill', ${i})`),
    );
  }
  sql += chips.join(",\n") + ";\n\n";
  return sql;
}

const experiences = [
  {
    id: 11,
    role: "Engineering AI Specialist",
    company: "YourClient",
    start: "2026-09",
    end: null,
    loc: "Your City, SP",
    summary:
      "AI-as-Infrastructure rollout for YourClient | YourClient banking services — developer harnesses, CI/CD integration, and cross-team governance for a core banking system migration across 8 squads.",
    highlights: [
      "Spearheading the enterprise rollout of AI-as-Infrastructure into CI/CD pipelines and developer harnesses for 8 engineering and data teams delivering banking services at YourClient | YourClient",
      "Orchestrating cross-team delivery and technical governance for a large-scale core banking system migration across all squads",
      "Engineered full-stack batch automation tooling in Python and React to streamline Kanban task management and card metadata for 8 squads",
      "Built management tracking dashboards and analytics giving executives and managers continuous visibility into team performance and migration milestones",
      "Authored technical playbooks, troubleshooting guides, and documentation driving smooth squad onboarding and structured AI harness adoption",
    ],
    tech: [
      "Python",
      "React",
      "AI-as-Infrastructure",
      "CI/CD",
      "Developer Harnesses",
      "Technical Governance",
      "Kanban Automation",
      "Dashboards & Analytics",
      "Technical Documentation",
    ],
  },
  {
    id: 12,
    role: "Full-Stack Engineer",
    company: "Stealth Startup (NDA)",
    start: "2026-06",
    end: null,
    loc: "Your City, SP",
    summary:
      "DevOps, AI engineering, data engineering, full-stack development, and product engineering on a geolocated social platform: C#/.NET backend, React frontend, Flutter apps, and Python AI services (LangChain, Vertex AI) on GCP, behind Terraform infrastructure, load-balanced async workflows, and GitHub Actions CI/CD.",
    highlights: [
      "Built an agent-and-RAG creator platform on LangGraph and Qdrant",
      "Ran geolocated 2026 election data pipelines as ETL on Docker and Kubernetes",
      "Implemented multi-tenant restaurant menu ingestion from HTML, PDF, PNG, and QR codes",
      "Shipped real-time bus tracking",
      "Process engineering through the Jira-integrated SDLC harness: automated all Jira card flows and backlogs, with AI architecture and quality gates for system design, test coverage, cost calculation, lint, and vulnerability scans",
      "Managed GCP infrastructure with Terraform and Cloud Run behind GitHub Actions CI/CD",
      "Distributed traffic with load balancing and processed jobs through async workflows on GCP",
    ],
    tech: [
      "C#/.NET",
      "React",
      "TypeScript",
      "Flutter",
      "Python",
      "LangChain",
      "Vertex AI",
      "GCP",
      "Terraform",
      "GitHub Actions",
      "Docker",
      "Kubernetes",
    ],
  },
  {
    id: 1,
    role: "Senior Frontend Developer",
    company: "YourCompany",
    start: "2025-12",
    end: "2026-09",
    loc: "Your City, SP",
    summary:
      "React, TypeScript, and AI-augmented frontend development — agent harnesses, test automation, and business dashboards.",
    highlights: [
      "Developing frontend features based on design, engineering, and business specifications",
      "Developing and testing the Cursor agent harness used by the frontend development team",
      "Building agent tooling to reduce token use and latency of Cursor flows",
      "Created a complete test harness to generate and validate unit and integration tests",
      "Developing dashboards and promoting business insights through data",
    ],
    tech: ["React", "TypeScript", "Cursor", "LLMs", "Test Automation", "CI/CD"],
  },
  {
    id: 2,
    role: "Senior Frontend Developer",
    company: "YourCompany",
    start: "2025-04",
    end: "2026-01",
    loc: "Your City, SP",
    summary:
      "Flutter/Dart development on the YourCompany HR ERP — people-tech platform for collaborator retention and development.",
    highlights: [
      "Developing new features of the YourCompany HR ERP web app",
      "API integration tests using Postman and DevTools",
      "Creating data processing Dart functions to build charts and dashboards",
      "Prototyping API endpoints on Supabase / PostgreSQL",
    ],
    tech: ["Flutter", "Dart", "FlutterFlow", "JavaScript", "Supabase", "PostgreSQL", "Postman"],
  },
  {
    id: 3,
    role: "Co-founder & Lead Developer",
    company: "YourCompany",
    start: "2023-11",
    end: null,
    loc: "Your City, SP",
    summary:
      "AI-powered EdTech SaaS for English teachers — personalized learning paths, lesson automation, and full-stack delivery.",
    highlights: [
      "Spearheaded AI-powered EdTech SaaS using FlutterFlow, Supabase, TypeScript Edge Functions, Dart, Flutter, and Python",
      "Built lean CI/CD pipeline using GitHub Actions and Vercel for multi-environment deployments",
      "Integrated GroqCloud, LangChain, and LangSmith with AI prompt chains and chain-of-thought workflows",
      "Implemented LLM routing for structured data generation, cleaning, validation, and fallback mechanisms",
      "Led unit tests, architecture design, database management, and scalable PostgreSQL backend solutions",
      "Contributed to business strategy, branding, pricing, sales, and financial modeling dashboards",
    ],
    tech: [
      "TypeScript",
      "Python",
      "LangChain",
      "GroqCloud",
      "LangSmith",
      "FlutterFlow",
      "Supabase",
      "Edge Functions",
      "PostgreSQL",
      "GitHub Actions",
      "Vercel",
      "Docker",
    ],
  },
  {
    id: 4,
    role: "English Teacher & Entrepreneur",
    company: "Better Call Your",
    start: "2020-01",
    end: "2025-05",
    loc: "Your City, SP",
    summary:
      "Private English school with custom CRM, inbound metrics, and GenAI-powered learning — 50+ students from junior analyst to C-level.",
    highlights: [
      "Developed and delivered engaging online English lessons for 50+ students of diverse ages and proficiency levels",
      "Built local CRM (frontend and backend) using Python (Streamlit and Pandas) processing CSV financial reports into dashboards",
      "Converted 60%+ of leads into paying students through effective sales and referral strategies",
      "Increased student engagement by 20% through interactive lesson plans and gamified learning activities",
      "Leveraged Ellii, AI roleplay, ASAAS, Google Calendar, and Google Meet to enhance customer experience",
      "Conducted market research and implemented data-driven insights to optimize business growth",
    ],
    tech: ["Python", "Streamlit", "Pandas", "GenAI", "CRM", "AI Roleplay"],
  },
  {
    id: 5,
    role: "Franchise Educational Coordinator",
    company: "YourCompany",
    start: "2016-11",
    end: "2020-01",
    loc: "Your City, SP",
    summary: "Managed educational departments for two training organizations with 500+ students.",
    highlights: [
      "Managed educational departments for two training organizations, overseeing 3–5 teachers and ~500 students",
      "Implemented data-driven best practices and standardized curriculum delivery, increasing engagement by 60%+",
      "Applied qualitative research from performance, feedback, and offboarding to reduce churn by 50%+",
      "Recruited, trained, and onboarded new teachers ensuring adherence to pedagogical standards",
      "Provided exceptional customer service addressing educational, technical, and logistical issues",
    ],
    tech: ["People Management", "CRM", "Data Analysis"],
  },
  {
    id: 6,
    role: "ESL English Teacher",
    company: "YourCompany",
    start: "2016-11",
    end: "2020-01",
    loc: "Your City, SP",
    summary: "English instruction for adults, children, and teenagers using the YourCompany method.",
    highlights: [
      "Developed engaging English lessons for all levels following the YourCompany method",
      "Evaluated speaking, listening, reading, and writing to tailor classes to student challenges",
      "Employed storytelling and gamification to improve proficiency and fluency outcomes",
      "Participated in coordination meetings to share best practices and enhance learning experiences",
    ],
    tech: ["ESL", "Gamification", "Teaching"],
  },
  {
    id: 7,
    role: "Electronic Engineering Intern",
    company: "YourCompany",
    start: "2012-06",
    end: "2013-06",
    loc: "Your City, SP",
    summary:
      "Product illumination calibration, UX-oriented panel switches, and engineering documentation.",
    highlights: [
      "Analyzed, measured, and calibrated product illumination using SpecWin Pro software",
      "Created and maintained detailed engineering documentation for the product development team",
      "Contributed to lighted panel switch development with a user-centered approach",
      "Worked following waterfall project management methodologies",
    ],
    tech: ["SpecWin Pro", "UX", "Waterfall"],
  },
  {
    id: 8,
    role: "Automation & Control Lab Tutor",
    company: "Your University",
    start: "2011-12",
    end: "2012-06",
    loc: "Your City, SP",
    summary:
      "Robotics tutoring with VEX and Lego kits — C++, PID control, and sensor integration.",
    highlights: [
      "Assisted students troubleshooting and refining mechanical designs for robotic systems",
      "Guided sensor integration and effective integration with processing units",
      "Helped students overcome coding challenges in C++ with line followers and PID control systems",
      "Encouraged project-based learning through automation, robotics, and IoT examples",
    ],
    tech: ["C++", "VEX", "PID Control", "Robotics", "IoT"],
  },
  {
    id: 9,
    role: "Technical Sales Intern",
    company: "YourCompany",
    start: "2011-04",
    end: "2011-08",
    loc: "Diadema, SP",
    summary: "B2B technical sales support for prototype delivery to global automotive clients.",
    highlights: [
      "Supported technical sales by ensuring timely prototype delivery meeting client specifications",
      "Attended weekly delivery planning meetings and kept stakeholders informed on progress",
      "Developed B2B client relationship skills through interactions in English and Portuguese",
    ],
    tech: ["B2B", "Project Management", "Technical Sales"],
  },
  {
    id: 10,
    role: "High School Physics Teacher",
    company: "YourInstitution",
    start: "2010-06",
    end: "2012-08",
    loc: "Your City, SP",
    summary:
      "Physics instruction and exam prep for university entrance exams (Fuvest, Unicamp, ENEM).",
    highlights: [
      "Delivered engaging physics lessons for high school students preparing for university entrance exams",
      "Provided individualized support solving physics questions and addressing learning challenges",
      "Worked on yearly task force correcting Fuvest, Unicamp, and ENEM exams for student publication",
    ],
    tech: ["Physics", "Teaching", "Problem Solving"],
  },
];

const education = [
  {
    id: 1,
    inst: "NoCode StartUp",
    degree: "Specialization — Prompt Engineering for SaaS Business Development",
    start: "2025-09",
    end: "2026-01",
    loc: "Online",
    summary: "Prompt engineering applied to SaaS product and business development.",
  },
  {
    id: 2,
    inst: "NoCode StartUp",
    degree: "Specialization — Low-Code / No-Code Development",
    start: "2023-11",
    end: "2026-01",
    loc: "Online",
    summary: "FlutterFlow, Supabase, and no-code product development track.",
  },
  {
    id: 3,
    inst: "Your University",
    degree: "VET — Diploma of Project Management",
    field: "Project Management",
    start: "2014-06",
    end: "2016-06",
    loc: "Your City, Country · Hybrid",
    summary:
      "Australian VET qualification in project planning and delivery, completed through hybrid on-campus and remote study.",
  },
  {
    id: 4,
    inst: "Your University",
    degree: "VET — Diploma of Management",
    field: "Human Resources Management",
    start: "2014-06",
    end: "2016-06",
    loc: "Your City, Country · Hybrid",
    summary:
      "Australian VET qualification in personnel administration and people management, completed through hybrid study.",
  },
  {
    id: 5,
    inst: "Your University",
    degree: "VET — Diploma of Business",
    field: "Business Administration, Management and Operations",
    start: "2014-06",
    end: "2016-06",
    loc: "Your City, Country · Hybrid",
    summary:
      "Australian VET qualification in business administration and operations, completed through hybrid study.",
  },
  {
    id: 6,
    inst: "Your University",
    degree: "Bachelor of Engineering (BE)",
    field: "Automation and Control Engineering",
    start: "2008-12",
    end: "2013-11",
    loc: "Your City, SP",
    summary: "Automation, control systems, robotics, and engineering fundamentals.",
  },
];

const certs = [
  {
    name: "Zero ao App — Aplicativo de Finanças",
    issuer: "NoCode StartUp",
    issued: "2024-05",
    url: "https://flix.nocodestartup.io/verify/Y2VydGlmaWNhdGVfMTE5M18zMjY=",
  },
  {
    name: "Fundamentos FlutterFlow — Design e Backend do Zero",
    issuer: "NoCode StartUp",
    issued: "2024-04",
    url: "https://flix.nocodestartup.io/verify/4dc1957470732df0d5827b336e1e6f1d29b1236e",
  },
  {
    name: "Fundamentos Desenvolvimento de Produtos",
    issuer: "NoCode StartUp",
    issued: "2024-04",
    url: "https://flix.nocodestartup.io/verify/Y2VydGlmaWNhdGVfMTE5M18yOTE=",
  },
  {
    name: "Introdução a Trilha IA — MasterClass IA & Engenharia de Prompts",
    issuer: "NoCode StartUp",
    issued: "2024-04",
    url: "https://flix.nocodestartup.io/verify/fb010e720e595f8de1792497753a0c45ab2a4a5c",
  },
  {
    name: "Fundamentos Desenvolvimento de Software",
    issuer: "NoCode StartUp",
    issued: "2024-04",
    url: "https://flix.nocodestartup.io/verify/Y2VydGlmaWNhdGVfMTE5M18zMTQ=",
  },
  {
    name: "Fundamentos Supabase | App de Cursos EAD 1.0",
    issuer: "NoCode StartUp",
    issued: "2023-12",
    url: "https://flix.nocodestartup.io/verify/cd1ac43de5f7126df1956702403061a3553f3299",
  },
  {
    name: "Modelagem de Dados NoSQL",
    issuer: "NoCode StartUp",
    issued: "2023-11",
    url: "https://flix.nocodestartup.io/verify/65c5e49c664c7b3326034a87047a7b6432a0c41c",
  },
  {
    name: "Meu Primeiro Super App | App dos Sonhos",
    issuer: "NoCode StartUp",
    issued: "2023-11",
    url: "https://flix.nocodestartup.io/verify/4209e169e5a37557fee2b79cfc98e567fa0576fd",
  },
  {
    name: "TOEFL iBT — TBD",
    issuer: "ETS",
    issued: "2013-08",
    expiry: "2015-08",
    url: null,
  },
  {
    name: "FCE — First Certificate in English (Grade C)",
    issuer: "Cambridge University Press & Assessment",
    issued: "2004-12",
    url: null,
  },
];

const skillCategories = {
  "Technical Skills": [
    "Test Automation",
    "System Administration & Automation",
    "AI Agent",
    "LLM Agents",
    "Agentic AI Tools",
    "Agentic RAG",
    "AI Context Engineer",
    "AI Software Development",
    "AI Tooling",
    "AI Toolkit with Cursor",
    "AI-Assisted Development (Cursor / Codex / MCP)",
    "AI/LLM Engineering",
    "AI/LLM Integration",
    "Analytics",
    "API Development",
    "API Integration",
    "APIs",
    "REST/GraphQL APIs",
    "Flutter Applications",
    "Application Programming Interfaces (API)",
    "LLM Architecture (Generative AI)",
    "MCP Architecture",
    "Artificial Intelligence (AI)",
    "Atomic Design",
    "Automation",
    "Bash",
    "Architecture Best Practices",
    "UX/UI Best Practices",
    "Business Analysis",
    "C++",
    "Chatbot Development",
    "ChatGPT",
    "CI/CD",
    "Continuous Integration and Continuous Delivery (CI/CD)",
    "Cursor AI",
    "Data Analysis",
    "Data Engineering",
    "Data Extraction",
    "Data Management",
    "Database Vectorization",
    "Databases",
    "Debugging Code",
    "Mobile App Development with FlutterFlow",
    "Flutter Development",
    "Design System",
    "DevOps",
    "ETL",
    "Automation Tools (Jenkins, GitLab, Ansible, Terraform, GitHub, Harness)",
    "Fine-Tuning Models",
    "Firebase",
    "Flutter",
    "FlutterFlow",
    "Full-Stack Development",
    "Generative AI",
    "Generative AI Tools",
    "Git / GitHub / GitLab",
    "Harness Engineering",
    "Integrated AI",
    "REST API Integration",
    "Internet of Things (IoT)",
    "JavaScript",
    "Jira",
    "LangChain",
    "LLMOps",
    "Large Language Model Operations (LLMOps)",
    "Large Language Models (LLM)",
    "Advanced State Management",
    "Manus",
    "Market Research",
    "Transformer Models",
    "Natural Language Processing",
    "No-Code / Low-Code Development",
    "NoSQL",
    "NotebookLM",
    "Object-Oriented Programming (OOP)",
    "Performance",
    "PostgreSQL",
    "Programming",
    "Project Management",
    "Prompt Engineering",
    "Python",
    "QA Automation",
    "React",
    "Requirements Analysis",
    "Responsible AI",
    "Retrieval-Augmented Generation (RAG)",
    "Skill Development",
    "Software Development",
    "Software Troubleshooting",
    "SOLID Design Principles",
    "Statistics",
    "Supabase",
    "Testing",
    "Unit & Integration Testing",
    "Text Generation",
    "TypeScript",
    "User Interface Prototyping",
    "Web Applications",
    "Web Development",
    "Word Embeddings",
  ],
  "Soft Skills": [
    "Attention to Detail",
    "Autonomy",
    "Team Collaboration",
    "Communication",
    "Clear Communication",
    "Clear Communication with Product & Design Teams",
    "Cross-Functional Team Leadership",
    "Customer Success",
    "Customer Support",
    "Leadership",
    "Learning Management",
    "Mentoring",
    "Developer Mentoring",
    "Ownership",
    "Systems Thinking",
    "Mature Posture",
    "Proactivity",
    "Problem Solving",
    "Resilience",
    "Sense of Priority",
    "Stakeholder Relations",
    "Teamwork",
    "Business Vision",
    "Product Vision",
  ],
  Languages: [
    "Português — Native",
    "Inglês — Fluent",
    "Espanhol — Intermediate",
  ],
  Methodologies: [
    "Agile & Waterfall Methodologies",
    "Project Planning & Development",
    "Back-End Operations",
    "Brand Development",
    "Business Insights",
    "Business Logic",
    "Business Management",
    "Business Metrics",
    "Churn Management",
    "Clean Code",
    "Code Review",
    "Competitive Analysis",
    "CRM",
    "Design System",
    "Design Thinking",
    "Educational Technology",
    "Gamification",
    "Inbound Marketing",
    "Kanban",
    "Key Performance Indicators",
    "Lean UX",
    "Learning Experience Design",
    "Onboarding",
    "Product Discovery",
    "Product Launch",
    "Product Leadership",
    "Product Lifecycle Management",
    "Product Management",
    "Product Marketing",
    "Product Requirements",
    "Product Road Mapping",
    "Product Strategy",
    "Product-Led Growth",
    "Research Skills",
    "Responsible AI",
    "Retrieval-Augmented Generation (RAG)",
    "Scrum",
    "Scrum / Kanban",
    "Stakeholder Management",
    "User Experience (UX)",
    "User Research",
  ],
  "Business Domains": [
    "Learning Management System (LMS)",
    "Language Learning",
    "Automation",
    "Business Development",
    "Learning Path Development",
    "Learning Experience Design",
    "EdTech",
    "ERP",
    "People Management",
    "HRTech",
    "Marketing",
    "Product Development",
    "SaaS",
    "SaaS / PaaS",
  ],
};

function buildExperienceTechSql() {
  const techRows = [];
  for (const e of experiences) {
    e.tech.forEach((t, i) => techRows.push(`  (${e.id}, '${esc(t)}', ${i})`));
  }
  return `INSERT INTO experience_tech (experience_id, label, sort_order) VALUES\n${techRows.join(",\n")};\n`;
}

function buildExperienceSql() {
  let sql = "INSERT INTO experience (id, role, company, start_date, end_date, location, summary, sort_order) VALUES\n";
  sql +=
    experiences
      .map(
        (e, i) =>
          `  (${e.id}, '${esc(e.role)}', '${esc(e.company)}', '${e.start}', ${e.end ? `'${e.end}'` : "NULL"}, '${esc(e.loc)}', '${esc(e.summary)}', ${i})`,
      )
      .join(",\n") + ";\n\n";

  sql += "INSERT INTO experience_highlight (experience_id, body, sort_order) VALUES\n";
  const hlRows = [];
  for (const e of experiences) {
    e.highlights.forEach((h, i) => hlRows.push(`  (${e.id}, '${esc(h)}', ${i})`));
  }
  sql += hlRows.join(",\n") + ";\n\n";

  sql += buildExperienceTechSql() + "\n";
  return sql;
}

function buildEducationSql() {
  let sql =
    "INSERT INTO education (id, institution, degree, field, start_date, end_date, location, summary, sort_order) VALUES\n";
  sql +=
    education
      .map(
        (e, i) =>
          `  (${e.id}, '${esc(e.inst)}', '${esc(e.degree)}', '${esc(e.field)}', '${e.start}', '${e.end}', '${esc(e.loc)}', '${esc(e.summary)}', ${i})`,
      )
      .join(",\n") + ";\n\n";
  return sql;
}

function buildCertSql() {
  let sql =
    "INSERT INTO certification (id, name, issuer, issued_date, expiry_date, verify_url, sort_order) VALUES\n";
  sql +=
    certs
      .map(
        (c, i) =>
          `  (${i + 1}, '${esc(c.name)}', '${esc(c.issuer)}', '${c.issued}', ${c.expiry ? `'${c.expiry}'` : "NULL"}, ${c.url ? `'${c.url}'` : "NULL"}, ${i})`,
      )
      .join(",\n") + ";\n\n";
  return sql;
}

function buildSkillsSql() {
  const catNames = Object.keys(skillCategories);
  let sql = "INSERT INTO skill_category (id, name, sort_order) VALUES\n";
  sql += catNames.map((n, i) => `  (${i + 1}, '${esc(n)}', ${i})`).join(",\n") + ";\n\n";
  sql += "INSERT INTO skill_item (category_id, label, sort_order) VALUES\n";
  const rows = [];
  catNames.forEach((cat, ci) => {
    skillCategories[cat].forEach((label, si) => {
      rows.push(`  (${ci + 1}, '${esc(label)}', ${si})`);
    });
  });
  sql += rows.join(",\n") + ";\n";
  return sql;
}

function replaceInsertBlock(seed, tableName, sql) {
  const re = new RegExp(`INSERT INTO ${tableName}[\\s\\S]*?;\\n`);
  if (!re.test(seed)) {
    throw new Error(`INSERT INTO ${tableName} not found in seed.sql`);
  }
  return seed.replace(re, sql.trimEnd() + "\n");
}

function replaceCvSection(seed, cvSql) {
  const startToken = "INSERT INTO professional_profile_cv ";
  const start = seed.indexOf(startToken);
  if (start < 0) {
    throw new Error("professional_profile_cv insert not found in seed.sql");
  }
  const articleToken = "INSERT INTO article ";
  const article = seed.indexOf(articleToken);
  if (article < 0) {
    throw new Error("article insert not found in seed.sql");
  }
  return seed.slice(0, start) + cvSql.trim() + "\n\n" + seed.slice(article);
}

const skillCount = Object.values(skillCategories).reduce((n, items) => n + items.length, 0);
const outputPath = path.join(root, "db", "seed.sql");
let seed = fs.readFileSync(outputPath, "utf8");
seed = replaceInsertBlock(seed, "experience_tech", buildExperienceTechSql());
seed = replaceCvSection(seed, buildCvSeedSql(esc));
fs.writeFileSync(outputPath, seed, "utf8");
console.info(`Updated CV variants and experience_tech in ${outputPath}`);
console.info(
  `Experience: ${experiences.length}, Education: ${education.length}, Certifications: ${certs.length}, Skills: ${skillCount}`,
);
