import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const esc = (s) => String(s).replace(/'/g, "''");

const profile = `INSERT INTO site_profile (
  id, name, title, pitch, about_paragraphs, email, city, country,
  github_url, linkedin_url, footer_note
) VALUES (
  1,
  'Your Name',
  'Senior Software Engineer',
  'I craft AI-powered products that turn complex ideas into scalable, user-friendly experiences.',
  '["I am a Senior Software Engineer with over a decade of experience shipping applied AI products. My work revolves around optimizing large language models (LLMs), developing Retrieval-Augmented Generation (RAG) architectures, and integrating AI-driven automation into scalable applications for education.","Specialist in Python, TypeScript, JavaScript, Dart, and Flutter, with extensive experience in LangChain, Langflow, CrewAI, and AI agents. Built AI-driven lesson creation pipelines that cut production time from hours to seconds at YourCompany. Leads AI-augmented frontend engineering with React and Cursor at YourCompany.","Beyond development, offers business strategy, AI-driven market research, and customer engagement experience — including reducing churn by 50% at a private training business. Based in Your City, UTC−3. Open to Senior Software Engineer opportunities in LLMs, NLP, RAG, and AI automation."]',
  'you@example.com',
  'Your City',
  'Brazil',
  'https://github.com/your-username',
  'https://www.linkedin.com/in/your-username/',
  'Built with React, shadcn/ui, and anime.js.'
);`;

const profProfiles = `INSERT INTO professional_profile (id, title, slug, summary, accent, resume_url, sort_order) VALUES
  (1, 'Senior Software Engineer', 'ai-engineer', 'LLM integrations, RAG pipelines, AI agents, and production-ready AI workflows.', 'from-violet-700 via-purple-500 to-fuchsia-400', '/resumes/ai-engineer.pdf', 0),
  (2, 'Senior Frontend Engineer', 'senior-frontend-engineer', 'Scalable React/TypeScript frontends with AI-augmented engineering practices.', 'from-blue-600 via-blue-500 to-cyan-400', '/resumes/senior-frontend-engineer.pdf', 1),
  (3, 'Product Engineer', 'product-engineer', 'EdTech founder mindset — ship fast, measure impact, and align product with business outcomes.', 'from-emerald-700 via-teal-500 to-lime-400', '/resumes/product-engineer.pdf', 2);

INSERT INTO professional_profile_chip (profile_id, label, kind, sort_order) VALUES
  (1, 'Python', 'stack', 0), (1, 'LangChain', 'stack', 1), (1, 'GroqCloud', 'stack', 2), (1, 'Supabase', 'stack', 3),
  (1, 'RAG', 'skill', 0), (1, 'LLMOps', 'skill', 1), (1, 'Prompt Engineering', 'skill', 2), (1, 'AI Agents', 'skill', 3), (1, 'LangSmith', 'skill', 4),
  (2, 'TypeScript', 'stack', 0), (2, 'React', 'stack', 1), (2, 'Flutter', 'stack', 2), (2, 'PostgreSQL', 'stack', 3),
  (2, 'Cursor', 'skill', 0), (2, 'CI/CD', 'skill', 1), (2, 'Testing', 'skill', 2), (2, 'System Design', 'skill', 3), (2, 'API Integration', 'skill', 4),
  (3, 'FlutterFlow', 'stack', 0), (3, 'Next.js', 'stack', 1), (3, 'TypeScript', 'stack', 2), (3, 'Analytics', 'stack', 3),
  (3, 'Product Strategy', 'skill', 0), (3, 'EdTech', 'skill', 1), (3, 'SaaS', 'skill', 2), (3, 'CRM & Metrics', 'skill', 3), (3, 'Go-to-Market', 'skill', 4);`;

const experiences = [
  {
    id: 1,
    role: "Senior Frontend Engineer",
    company: "YourCompany",
    start: "2026-01",
    end: null,
    loc: "Your City, BR",
    summary:
      "Scalable React frontends and AI-augmented engineering workflows using Cursor and LLMs.",
    highlights: [
      "Development of scalable frontend solutions using React, balancing performance, maintainability, and business-driven product delivery",
      "Designing AI-augmented engineering workflows through advanced use of Cursor and LLMs, enabling faster development cycles and improved code consistency",
      "Building internal frameworks, contextual engineering standards, and AI-assisted development guidelines",
      "Developing automated quality assurance AI-augmented module with unit, integration, and regression testing approaches",
      "Acting as a bridge between product strategy and technical execution; identifying bottlenecks across the software delivery lifecycle",
      "Enabling the squad through AI adoption initiatives and knowledge-sharing new practices",
    ],
    tech: ["React", "TypeScript", "Cursor", "LLMs", "CI/CD"],
  },
  {
    id: 2,
    role: "Senior Frontend Developer",
    company: "YourCompany",
    start: "2025-05",
    end: "2026-01",
    loc: "Your City, BR",
    summary:
      "People-tech HR ERP — agent-driven legacy migration and collaborator development platform features.",
    highlights: [
      "Stack migration of AI-agent framework from Flutter to JavaScript",
      "Creating agent-driven frameworks for documenting frontend and developing new features inside a legacy system",
      "Developing new features of the YourCompany HR ERP web app",
      "API integration tests using Postman and DevTools",
      "Creating data processing DART functions to build charts and dashboards",
      "Prototyping API endpoints on Supabase / PostgreSQL",
    ],
    tech: ["Flutter", "JavaScript", "Dart", "Supabase", "PostgreSQL", "Postman"],
  },
  {
    id: 3,
    role: "Founding Engineer",
    company: "YourCompany",
    start: "2023-12",
    end: "2026-04",
    loc: "Your City, BR",
    summary:
      "AI-powered EdTech SaaS for English teachers — personalized learning paths and lesson automation.",
    highlights: [
      "Spearheaded AI-powered EdTech SaaS using FlutterFlow, Supabase, TypeScript Edge Functions, Dart, Flutter, and Python",
      "Built lean CI/CD pipeline using GitHub Actions and Vercel for multi-environment deployments",
      "Integrated GroqCloud, LangChain, and LangSmith with AI prompt chains and chain-of-thought workflows",
      "Implemented LLM routing for structured data generation, cleaning, validation, and fallback mechanisms in TypeScript",
      "Led unit tests, architecture design, database management, and scalable PostgreSQL backend solutions",
      "Contributed to business strategy, branding, pricing, sales, and financial modeling dashboards",
    ],
    tech: [
      "TypeScript",
      "FlutterFlow",
      "LangChain",
      "Python",
      "PostgreSQL",
      "GitHub Actions",
      "Vercel",
    ],
  },
  {
    id: 4,
    role: "English Teacher & Entrepreneur",
    company: "Better Call Your",
    start: "2020-02",
    end: "2025-05",
    loc: "Your City, BR",
    summary:
      "Private English school with custom CRM, inbound metrics, and GenAI-powered learning tools.",
    highlights: [
      "Developed and delivered online English lessons for 50+ students of diverse ages and proficiency levels",
      "Built local CRM (frontend and backend) using Python (Streamlit and Pandas) processing CSV financial reports into dashboards",
      "Converted 60%+ of leads into paying students through effective sales and referral strategies",
      "Increased student engagement by 20% through interactive lesson plans and gamified learning activities",
      "Leveraged Ellii, AI roleplay, ASAAS, Google Calendar, and Google Meet to enhance customer experience",
      "Conducted market research and implemented data-driven insights to optimize business growth",
    ],
    tech: ["Python", "Streamlit", "Pandas", "GenAI", "CRM"],
  },
  {
    id: 5,
    role: "Franchise Educational Coordinator",
    company: "YourCompany",
    start: "2017-06",
    end: "2020-02",
    loc: "Your City, BR",
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
    start: "2016-12",
    end: "2017-07",
    loc: "Your City, BR",
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
    start: "2012-07",
    end: "2013-07",
    loc: "Your City, BR",
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
    role: "High School Physics Teacher",
    company: "YourInstitution",
    start: "2010-07",
    end: "2012-09",
    loc: "Your City, BR",
    summary:
      "Physics instruction and exam prep for university entrance exams (Fuvest, Unicamp, ENEM).",
    highlights: [
      "Delivered engaging physics lessons for high school students preparing for university entrance exams",
      "Provided individualized support solving physics questions and addressing learning challenges",
      "Worked on yearly task force correcting Fuvest, Unicamp, and ENEM exams for student publication",
    ],
    tech: ["Physics", "Teaching", "Problem Solving"],
  },
  {
    id: 9,
    role: "Automation & Control Lab Tutor",
    company: "Your University",
    start: "2012-01",
    end: "2012-07",
    loc: "Your City, BR",
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
    id: 10,
    role: "Technical Sales Intern",
    company: "YourCompany",
    start: "2011-05",
    end: "2011-09",
    loc: "Diadema, BR",
    summary: "B2B technical sales support for prototype delivery to global automotive clients.",
    highlights: [
      "Supported technical sales by ensuring timely prototype delivery meeting client specifications",
      "Attended weekly delivery planning meetings and kept stakeholders informed on progress",
      "Developed B2B client relationship skills through interactions in English and Portuguese",
    ],
    tech: ["B2B", "Project Management", "Technical Sales"],
  },
];

let expSql = "INSERT INTO experience (id, role, company, start_date, end_date, location, summary, sort_order) VALUES\n";
expSql +=
  experiences
    .map(
      (e, i) =>
        `  (${e.id}, '${esc(e.role)}', '${esc(e.company)}', '${e.start}', ${e.end ? `'${e.end}'` : "NULL"}, '${esc(e.loc)}', '${esc(e.summary)}', ${i})`,
    )
    .join(",\n") + ";\n\n";

let hlSql = "INSERT INTO experience_highlight (experience_id, body, sort_order) VALUES\n";
const hlRows = [];
for (const e of experiences) {
  e.highlights.forEach((h, i) => hlRows.push(`  (${e.id}, '${esc(h)}', ${i})`));
}
hlSql += hlRows.join(",\n") + ";\n\n";

let techSql = "INSERT INTO experience_tech (experience_id, label, sort_order) VALUES\n";
const techRows = [];
for (const e of experiences) {
  e.tech.forEach((t, i) => techRows.push(`  (${e.id}, '${esc(t)}', ${i})`));
}
techSql += techRows.join(",\n") + ";\n\n";

const education = [
  {
    id: 1,
    inst: "Language School",
    degree: "English Language Course",
    start: "1999-01",
    end: "2006-06",
    loc: "Your City, BR",
    summary: "Long-form English immersion programme from childhood through adolescence.",
  },
  {
    id: 2,
    inst: "Independent Study",
    degree: "TOEFL Preparation Course",
    start: "2013-07",
    end: "2013-11",
    loc: "Your City, BR",
    summary: "Intensive preparation for the TOEFL iBT examination.",
  },
  {
    id: 3,
    inst: "NoCode StartUp",
    degree: "No-Code & AI Development Track",
    start: "2023-12",
    end: "2024-06",
    loc: "Online",
    summary:
      "Comprehensive track covering FlutterFlow, Supabase, product development, software fundamentals, NoSQL, and AI/prompt engineering.",
  },
];

let eduSql = "INSERT INTO education (id, institution, degree, start_date, end_date, location, summary, sort_order) VALUES\n";
eduSql +=
  education
    .map(
      (e, i) =>
        `  (${e.id}, '${esc(e.inst)}', '${esc(e.degree)}', '${e.start}', '${e.end}', '${esc(e.loc)}', '${esc(e.summary)}', ${i})`,
    )
    .join(",\n") + ";\n\n";

const certs = [
  {
    name: "Zero ao App — Aplicativo de Finanças",
    issuer: "NoCode StartUp",
    issued: "2024-06",
    url: "https://flix.nocodestartup.io/verify/Y2VydGlmaWNhdGVfMTE5M18zMjY=",
  },
  {
    name: "Fundamentos Desenvolvimento de Produtos",
    issuer: "NoCode StartUp",
    issued: "2024-05",
    url: "https://flix.nocodestartup.io/verify/Y2VydGlmaWNhdGVfMTE5M18yOTE=",
  },
  {
    name: "Fundamentos Desenvolvimento de Software",
    issuer: "NoCode StartUp",
    issued: "2024-05",
    url: "https://flix.nocodestartup.io/verify/Y2VydGlmaWNhdGVfMTE5M18zMTQ=",
  },
  {
    name: "Fundamentos FlutterFlow — Design e Backend do Zero",
    issuer: "NoCode StartUp",
    issued: "2024-05",
    url: "https://flix.nocodestartup.io/verify/4dc1957470732df0d5827b336e1e6f1d29b1236e",
  },
  {
    name: "Introdução a Trilha IA — MasterClass IA & Engenharia de Prompts",
    issuer: "NoCode StartUp",
    issued: "2024-05",
    url: "https://flix.nocodestartup.io/verify/fb010e720e595f8de1792497753a0c45ab2a4a5c",
  },
  {
    name: "Fundamentos Supabase | App de Cursos EAD 1.0",
    issuer: "NoCode StartUp",
    issued: "2024-01",
    url: "https://flix.nocodestartup.io/verify/cd1ac43de5f7126df1956702403061a3553f3299",
  },
  {
    name: "Meu Primeiro Super App | App dos Sonhos",
    issuer: "NoCode StartUp",
    issued: "2023-12",
    url: "https://flix.nocodestartup.io/verify/4209e169e5a37557fee2b79cfc98e567fa0576fd",
  },
  {
    name: "Modelagem de Dados NoSQL",
    issuer: "NoCode StartUp",
    issued: "2023-12",
    url: "https://flix.nocodestartup.io/verify/65c5e49c664c7b3326034a87047a7b6432a0c41c",
  },
  {
    name: "Building Applications with LLMs (LangChain)",
    issuer: "DeepLearning.AI",
    issued: "2024-07",
    url: "https://www.deeplearning.ai",
  },
  {
    name: "TOEFL iBT — TBD",
    issuer: "ETS",
    issued: "2013-09",
    expiry: "2015-09",
    url: null,
  },
  {
    name: "FCE — First Certificate in English (Grade C)",
    issuer: "Cambridge University Press & Assessment",
    issued: "2005-01",
    url: null,
  },
];

let certSql =
  "INSERT INTO certification (id, name, issuer, issued_date, expiry_date, verify_url, sort_order) VALUES\n";
certSql +=
  certs
    .map(
      (c, i) =>
        `  (${i + 1}, '${esc(c.name)}', '${esc(c.issuer)}', '${c.issued}', ${c.expiry ? `'${c.expiry}'` : "NULL"}, ${c.url ? `'${c.url}'` : "NULL"}, ${i})`,
    )
    .join(",\n") + ";\n\n";

const projects = `INSERT INTO project (id, title, slug, description, gradient, featured, sort_order) VALUES
  (1, 'AI Agent System Template', 'ai-agent-system-template', 'Reusable template for building multi-agent AI systems with structured workflows and tool integration.', 'from-violet-900 via-purple-600 to-fuchsia-400', 1, 0),
  (2, 'Prompt-to-App Product Investigator', 'prompt-to-app-product-investigator', 'AI-powered tool that investigates product ideas and maps them to implementable app architectures.', 'from-indigo-950 via-indigo-600 to-indigo-300', 1, 1),
  (3, 'AI ChatBot UI', 'ai-chatbot-ui', 'Frontend interface for conversational AI with streaming responses and context management.', 'from-slate-800 via-blue-600 to-blue-300', 0, 2),
  (4, 'AI Code Editor', 'ai-code-editor', 'Experimental AI-assisted code editor exploring LLM-driven development workflows.', 'from-rose-950 via-rose-600 to-orange-400', 0, 3),
  (5, 'Next.js Portfolio', 'nextjs-portfolio', 'Personal portfolio site built with Next.js, showcasing projects and professional experience.', 'from-teal-900 via-teal-600 to-teal-300', 0, 4),
  (6, 'React Project Template', 'react-project-template', 'Opinionated React project starter with tooling and conventions for fast product development.', 'from-slate-900 via-slate-600 to-slate-300', 0, 5);

INSERT INTO project_link (project_id, kind, url, sort_order) VALUES
  (1, 'github', 'https://github.com/your-username/ai_agent_system_template', 0),
  (2, 'github', 'https://github.com/your-username/prompt-to-app-product-investigator', 0),
  (3, 'github', 'https://github.com/your-username/AIChatBot_ui', 0),
  (4, 'github', 'https://github.com/your-username/AI_code_editor', 0),
  (5, 'github', 'https://github.com/your-username/nextjs-portfolio', 0),
  (6, 'github', 'https://github.com/your-username/react-project-template', 0);

INSERT INTO project_tech (project_id, label, sort_order) VALUES
  (1, 'Python', 0), (1, 'LangChain', 1), (1, 'AI Agents', 2),
  (2, 'TypeScript', 0), (2, 'LLMs', 1), (2, 'Product Discovery', 2),
  (3, 'React', 0), (3, 'TypeScript', 1),
  (4, 'TypeScript', 0), (4, 'LLMs', 1), (4, 'Cursor', 2),
  (5, 'Next.js', 0), (5, 'React', 1),
  (6, 'React', 0), (6, 'TypeScript', 1);`;

const linkedinDump = fs.readFileSync(
  path.join(root, "db", "linkedin-profile.txt"),
  "utf8",
);
const skillsLine = linkedinDump.split("## Skills\n\n")[1]?.split("\n\n## Languages")[0] ?? "";
const skillItems = skillsLine.split("•").map((s) => s.trim()).filter(Boolean);

const titleCase = (s) =>
  s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const catRules = [
  [
    "AI & Machine Learning",
    /^(ai |artificial|langchain|llm|rag|nlp|genai|prompt|fine-tuning|inference|multimodal|chatbot|embedding|machine learning|responsible ai|retrieval|language model|contextual|generative ai|leveraging ai|integrating ai|scalable ai|robust ai|ai-|google ai|routing$|crew|langflow|word embedding)/i,
  ],
  ["Programming Languages", /^(typescript|javascript|python|dart|c\+\+|bash|sql$|oop)/i],
  [
    "Frontend & Mobile",
    /^(react|flutter|flutterflow|front-end|frontend|web development|webapp|user interface|user experience|user-centered|user research|mobile)/i,
  ],
  [
    "Backend, Data & Databases",
    /^(back-end|backend|postgresql|supabase|nosql|database|data |etl|api |apis|edge |datatables|csv|dashboard|charts)/i,
  ],
  [
    "DevOps, CI/CD & Tools",
    /^(git|github|ci\/cd|devops|vercel|postman|devtools|test automation|deployment|pipeline|jira|gnu make|cursor$|copilot|debugging)/i,
  ],
  [
    "Product, Business & Strategy",
    /^(product |business |market |sales |pricing|saas|startup|start-up|entrepreneur|co-founder|founding|fundraising|crm|inbound|brand |stakeholder|product-led|competitive|customer |churn|retention|metrics|kpi|projections|financial|payment|b2b|people tech|hr erp|accounts|key accounts|strategy |marketing$|project management)/i,
  ],
  [
    "Education & Pedagogy",
    /^(education|edtech|teaching|teacher|tutor|lesson|learning |student|pedagog|esl|english |gamification|physics|educational|college tutoring|private tutoring|skill training|franchise|adaptive learning|personalization|skill development)/i,
  ],
  [
    "Engineering & Robotics",
    /^(electronic|mechanical|robot|automation control|pid|vex|sensor|calibration|illumination|network switches|civil engineering|prototype|technical sales|engineering documentation|laboratory|applied mathematics|measurement|electronics|waterfall project)/i,
  ],
  [
    "Quality, Testing & Process",
    /^(quality |test |assurance|regression|agile|scrum|lean |software delivery|software reliability|software troubleshooting|best practices|standards|process improvement|requirements|feasibility|software development$|app development|end-to-end|validation$|integration test)/i,
  ],
  [
    "Leadership & Soft Skills",
    /^(leadership|teamwork|collaboration|communication|meeting facilitation|people management|cross-functional|recruitment|onboarding|offboarding|interviewing|storytelling|creativity|problem solving|decision-making|results-|international experience|management experience|management skills|leading team|team productivity|facilitator|coordination meeting)/i,
  ],
];

const skip = new Set([
  "across",
  "acting",
  "clean",
  "click",
  "com",
  "core",
  "dos",
  "environment",
  "flow",
  "forte",
  "gap",
  "grade",
  "guiding",
  "implementation",
  "inform",
  "launch",
  "led",
  "leading",
  "leads",
  "leveling",
  "meio",
  "models",
  "processing",
  "production",
  "progress",
  "publish",
  "reports",
  "service",
  "sheets",
  "stack",
  "support",
  "tests",
  "to design/project",
  "track",
  "designing",
  "designs",
  "developer",
  "development",
  "processes",
  "framework",
  "frameworks",
  "code",
  "coding",
  "engineer",
  "engineering",
  "managing",
  "planning",
  "optimization",
  "optimizing",
  "overseeing",
  "reinforcement",
  "reliability",
  "reporting",
  "research",
  "strategy",
  "technology",
  "testing",
  "validation",
  "visualization",
  "workflow",
  "documentation",
  "documenting",
  "design",
  "delivery",
  "deployment",
  "facilitating",
  "integration",
  "migration",
  "modeling",
  "metrics",
  "analysis",
  "analytical",
  "automation",
  "customization",
  "encouraging",
  "explaining",
  "facilitator",
  "feedback",
  "internal process",
  "pain points",
  "process",
  "productivity",
  "support students",
  "tailoring",
  "management",
  "coordination",
  "discovery",
  "logistics",
  "operations management",
  "platform management",
  "systems management",
  "specification",
  "prototyping",
  "prototype delivery",
  "prototypes",
  "content creation",
  "construction",
  "banking",
  "hospitality",
  "human resources",
  "acquire gim suite",
]);

const normalize = (s) => {
  const n = s.trim().toLowerCase();
  const aliases = {
    "artificial intelligence (ai)": "Artificial Intelligence",
    "ai (artificial intelligence)": "Artificial Intelligence",
    "retrieval-augmented generation (rag)": "Retrieval-Augmented Generation (RAG)",
    "retrieval-augmented generation": "Retrieval-Augmented Generation (RAG)",
    "large language models (llm)": "Large Language Models (LLM)",
    "large language models": "Large Language Models (LLM)",
    "large language model operations (llmops)": "LLMOps",
    "natural language processing (nlp)": "NLP",
    "continuous integration and continuous delivery (ci/cd)": "CI/CD",
    "ci/cd pipeline": "CI/CD Pipelines",
    "customer relationship management (crm)": "CRM",
    "application programming interfaces (api)": "APIs",
    "object-oriented programming (oop)": "OOP",
    "user experience (ux)": "User Experience (UX)",
    "extract, transform, load (etl)": "ETL",
    "internet of things (iot)": "IoT",
    "no-code/low-code development": "No-Code / Low-Code",
    "no-code/low-code": "No-Code / Low-Code",
    "dart, flutter": "Dart & Flutter",
    "supabase / postgresql": "Supabase / PostgreSQL",
    "react.js": "React.js",
    reactjs: "React",
    "ai-agent": "AI Agents",
    "ai agent": "AI Agents",
    genai: "GenAI",
    llm: "LLM",
    rag: "RAG",
    copilot: "GitHub Copilot",
    "problem-solving": "Problem Solving",
    "problem solving": "Problem Solving",
    typescript: "TypeScript",
    javascript: "JavaScript",
    langchain: "LangChain",
    postgresql: "PostgreSQL",
    nosql: "NoSQL",
    devops: "DevOps",
    edtech: "EdTech",
    "ci/cd": "CI/CD",
  };
  if (aliases[n]) return aliases[n];
  return titleCase(n).replace(/\bAi\b/g, "AI").replace(/\bCi\/Cd\b/g, "CI/CD");
};

const grouped = Object.fromEntries([
  ...catRules.map(([name]) => [name, []]),
  ["Spoken Languages", []],
  ["Other Technical & Professional", []],
]);
const seen = new Set();

for (const rawSkill of skillItems) {
  const item = normalize(rawSkill);
  if (!item || skip.has(item.toLowerCase()) || seen.has(item.toLowerCase())) continue;
  seen.add(item.toLowerCase());
  let placed = false;
  for (const [cat, re] of catRules) {
    if (re.test(item)) {
      grouped[cat].push(item);
      placed = true;
      break;
    }
  }
  if (!placed) grouped["Other Technical & Professional"].push(item);
}

["Português (Native)", "Inglês (Native / Bilingual)", "Espanhol (Limited Working Proficiency)"].forEach(
  (s) => grouped["Spoken Languages"].push(s),
);

let skillsSql = "INSERT INTO skill_category (id, name, sort_order) VALUES\n";
const catNames = Object.keys(grouped);
skillsSql += catNames.map((n, i) => `  (${i + 1}, '${esc(n)}', ${i})`).join(",\n") + ";\n\n";
skillsSql += "INSERT INTO skill_item (category_id, label, sort_order) VALUES\n";
const skillRows = [];
catNames.forEach((cat, ci) => {
  [...new Set(grouped[cat])].sort().forEach((label, si) => {
    skillRows.push(`  (${ci + 1}, '${esc(label)}', ${si})`);
  });
});
skillsSql += skillRows.join(",\n") + ";\n";

const out = `-- Seed data from LinkedIn profile (your-username)
-- Regenerate: node scripts/generate-linkedin-seed.mjs

${profile}

${profProfiles}

${expSql}${hlSql}${techSql}${eduSql}${certSql}${projects}

${skillsSql}`;

const outputPath = path.join(root, "db", "seed.sql");
fs.writeFileSync(outputPath, out, "utf8");
console.info(`Wrote ${outputPath}`);
console.info(`Experience: ${experiences.length}, Certifications: ${certs.length}, Skills: ${skillRows.length}`);
