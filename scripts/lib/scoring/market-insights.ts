// Market keyword prevalence dataset — deterministic source of truth for ATS/SEO scoring.
// Source: engineering-role market study (AI Engineer vs Automation Engineer vs Developer + AI).
// Values are percentages (0–100). Overall average = round(mean(roles), 1) computed below.

export type MarketRoleKey =
  | "aiEngineer"
  | "automationEngineer"
  | "developerPlusAi"
  | "overallAverage";

export type MarketKeywordRow = {
  category: string;
  keyword: string;
  /** Case-insensitive alias phrases; word-boundary matched against CV/site text. */
  aliases: string[];
  prevalence: {
    aiEngineer: number;
    automationEngineer: number;
    developerPlusAi: number;
  };
};

const ROWS: MarketKeywordRow[] = [
  // Programming Languages
  { category: "Programming Languages", keyword: "Python", aliases: ["python"], prevalence: { aiEngineer: 95, automationEngineer: 85, developerPlusAi: 90 } },
  { category: "Programming Languages", keyword: "SQL", aliases: ["sql", "relational database", "relational databases", "duckdb", "sqlite"], prevalence: { aiEngineer: 65, automationEngineer: 48, developerPlusAi: 70 } },
  { category: "Programming Languages", keyword: "JavaScript", aliases: ["javascript"], prevalence: { aiEngineer: 15, automationEngineer: 25, developerPlusAi: 75 } },
  { category: "Programming Languages", keyword: "TypeScript", aliases: ["typescript"], prevalence: { aiEngineer: 18, automationEngineer: 12, developerPlusAi: 82 } },
  { category: "Programming Languages", keyword: "Bash / PowerShell", aliases: ["bash", "powershell", "shell scripting"], prevalence: { aiEngineer: 35, automationEngineer: 52, developerPlusAi: 25 } },
  { category: "Programming Languages", keyword: "Java", aliases: ["java"], prevalence: { aiEngineer: 8, automationEngineer: 58, developerPlusAi: 22 } },
  { category: "Programming Languages", keyword: "C# / C++", aliases: ["c#", "c++", "csharp"], prevalence: { aiEngineer: 22, automationEngineer: 28, developerPlusAi: 18 } },
  // AI / ML & LLM Ecosystem
  { category: "AI / ML & LLM Ecosystem", keyword: "RAG (Retrieval-Augmented Gen)", aliases: ["rag", "retrieval-augmented generation", "retrieval augmented generation"], prevalence: { aiEngineer: 88, automationEngineer: 0, developerPlusAi: 42 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "PyTorch", aliases: ["pytorch"], prevalence: { aiEngineer: 82, automationEngineer: 2, developerPlusAi: 18 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "LangChain / LangGraph", aliases: ["langchain", "langgraph"], prevalence: { aiEngineer: 78, automationEngineer: 0, developerPlusAi: 45 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "OpenAI API / Claude / Gemini", aliases: ["openai", "claude", "anthropic", "gemini"], prevalence: { aiEngineer: 72, automationEngineer: 5, developerPlusAi: 80 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "MLOps / Model Serving (vLLM)", aliases: ["mlops", "llmops", "model serving", "vllm"], prevalence: { aiEngineer: 65, automationEngineer: 0, developerPlusAi: 15 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "LlamaIndex / CrewAI", aliases: ["llamaindex", "llama-index", "crewai"], prevalence: { aiEngineer: 62, automationEngineer: 0, developerPlusAi: 25 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "Prompt Engineering", aliases: ["prompt engineering", "prompt chains", "prompting"], prevalence: { aiEngineer: 58, automationEngineer: 2, developerPlusAi: 50 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "Fine-Tuning (LoRA / PEFT)", aliases: ["fine-tuning", "fine tuning", "finetuning", "lora", "peft"], prevalence: { aiEngineer: 55, automationEngineer: 0, developerPlusAi: 12 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "Hugging Face / Transformers", aliases: ["hugging face", "huggingface", "transformers", "transformer models", "transformer model", "bert"], prevalence: { aiEngineer: 50, automationEngineer: 0, developerPlusAi: 20 } },
  { category: "AI / ML & LLM Ecosystem", keyword: "CUDA / GPU Optimization", aliases: ["cuda", "gpu"], prevalence: { aiEngineer: 38, automationEngineer: 0, developerPlusAi: 5 } },
  // Vector DBs & Storage
  { category: "Vector DBs & Storage", keyword: "PostgreSQL (PGVector)", aliases: ["postgresql", "postgres", "pgvector"], prevalence: { aiEngineer: 68, automationEngineer: 20, developerPlusAi: 82 } },
  { category: "Vector DBs & Storage", keyword: "Pinecone / Qdrant / Weaviate", aliases: ["pinecone", "qdrant", "weaviate", "vector database", "vector databases", "vector store", "vector search", "vectorization"], prevalence: { aiEngineer: 75, automationEngineer: 0, developerPlusAi: 38 } },
  { category: "Vector DBs & Storage", keyword: "Redis / Cache", aliases: ["redis", "cache", "caching"], prevalence: { aiEngineer: 45, automationEngineer: 15, developerPlusAi: 58 } },
  { category: "Vector DBs & Storage", keyword: "MongoDB / NoSQL", aliases: ["mongodb", "mongo", "nosql"], prevalence: { aiEngineer: 32, automationEngineer: 18, developerPlusAi: 48 } },
  // Cloud & Infrastructure
  { category: "Cloud & Infrastructure", keyword: "Docker / Containerization", aliases: ["docker", "containerization", "containers", "containerized"], prevalence: { aiEngineer: 78, automationEngineer: 58, developerPlusAi: 75 } },
  { category: "Cloud & Infrastructure", keyword: "CI/CD (Jenkins/GitLab/Actions)", aliases: ["ci/cd", "ci-cd", "cicd", "continuous integration", "continuous delivery", "continuous deployment", "jenkins", "gitlab ci", "github actions"], prevalence: { aiEngineer: 52, automationEngineer: 88, developerPlusAi: 60 } },
  { category: "Cloud & Infrastructure", keyword: "AWS (SageMaker/Bedrock/Lambda)", aliases: ["aws", "amazon web services", "sagemaker", "bedrock", "aws lambda"], prevalence: { aiEngineer: 72, automationEngineer: 45, developerPlusAi: 68 } },
  { category: "Cloud & Infrastructure", keyword: "Kubernetes (K8s)", aliases: ["kubernetes", "k8s"], prevalence: { aiEngineer: 62, automationEngineer: 28, developerPlusAi: 32 } },
  { category: "Cloud & Infrastructure", keyword: "Terraform / Ansible", aliases: ["terraform", "ansible"], prevalence: { aiEngineer: 25, automationEngineer: 48, developerPlusAi: 20 } },
  // Automation & Testing
  { category: "Automation & Testing", keyword: "PyTest / JUnit / TestNG", aliases: ["pytest", "junit", "testng", "unit testing", "unit tests", "integration testing", "integration tests", "tdd"], prevalence: { aiEngineer: 42, automationEngineer: 75, developerPlusAi: 45 } },
  { category: "Automation & Testing", keyword: "API Testing (Postman/RestAssured)", aliases: ["postman", "restassured", "rest assured", "api testing", "api tests", "api contract tests", "api integration tests", "contract testing"], prevalence: { aiEngineer: 15, automationEngineer: 82, developerPlusAi: 35 } },
  { category: "Automation & Testing", keyword: "Selenium WebDriver", aliases: ["selenium"], prevalence: { aiEngineer: 0, automationEngineer: 78, developerPlusAi: 5 } },
  { category: "Automation & Testing", keyword: "Playwright / Cypress", aliases: ["playwright", "cypress"], prevalence: { aiEngineer: 0, automationEngineer: 68, developerPlusAi: 12 } },
  { category: "Automation & Testing", keyword: "PLC / SCADA / HMI", aliases: ["plc", "scada", "hmi", "ladder logic", "programmable logic controller"], prevalence: { aiEngineer: 0, automationEngineer: 35, developerPlusAi: 0 } },
  { category: "Automation & Testing", keyword: "UiPath / RPA Frameworks", aliases: ["uipath", "blue prism", "rpa", "robotic process automation"], prevalence: { aiEngineer: 0, automationEngineer: 28, developerPlusAi: 0 } },
  // Software Architecture
  { category: "Software Architecture", keyword: "Git / Version Control", aliases: ["git", "version control"], prevalence: { aiEngineer: 90, automationEngineer: 92, developerPlusAi: 95 } },
  { category: "Software Architecture", keyword: "RESTful API / GraphQL", aliases: ["rest api", "rest apis", "restful", "graphql"], prevalence: { aiEngineer: 65, automationEngineer: 55, developerPlusAi: 92 } },
  { category: "Software Architecture", keyword: "FastAPI / Flask / Express", aliases: ["fastapi", "flask", "express.js", "expressjs"], prevalence: { aiEngineer: 70, automationEngineer: 18, developerPlusAi: 85 } },
  { category: "Software Architecture", keyword: "System Design & Architecture", aliases: ["system design", "system architecture", "systems design", "application architecture", "architecture"], prevalence: { aiEngineer: 65, automationEngineer: 30, developerPlusAi: 78 } },
  { category: "Software Architecture", keyword: "Microservices Architecture", aliases: ["microservice", "microservices"], prevalence: { aiEngineer: 58, automationEngineer: 32, developerPlusAi: 75 } },
  { category: "Software Architecture", keyword: "React / Next.js", aliases: ["react", "next.js", "nextjs"], prevalence: { aiEngineer: 22, automationEngineer: 8, developerPlusAi: 88 } },
  // Full-stack additions — developerPlusAi measured from a 2026-11 scan of 21
  // full-stack postings (Remotive/Jobicy/RemoteOK/Himalayas/Arbeitnow).
  // aiEngineer/automationEngineer interpolated from analogous rows (frontend,
  // backend and process analogs) pending the formal market study.
  { category: "Programming Languages", keyword: "Node.js", aliases: ["node.js", "nodejs"], prevalence: { aiEngineer: 28, automationEngineer: 15, developerPlusAi: 40 } },
  { category: "Frontend & UX", keyword: "Tailwind CSS", aliases: ["tailwind"], prevalence: { aiEngineer: 12, automationEngineer: 5, developerPlusAi: 25 } },
  { category: "Frontend & UX", keyword: "HTML & CSS", aliases: ["html", "css"], prevalence: { aiEngineer: 15, automationEngineer: 10, developerPlusAi: 40 } },
  { category: "Frontend & UX", keyword: "State Management", aliases: ["state management", "redux", "zustand", "react query"], prevalence: { aiEngineer: 8, automationEngineer: 3, developerPlusAi: 20 } },
  { category: "Frontend & UX", keyword: "UI/UX Collaboration", aliases: ["ui/ux", "figma", "design handoff"], prevalence: { aiEngineer: 12, automationEngineer: 3, developerPlusAi: 30 } },
  { category: "Frontend & UX", keyword: "Web Accessibility", aliases: ["accessibility", "a11y", "wcag"], prevalence: { aiEngineer: 10, automationEngineer: 4, developerPlusAi: 30 } },
  { category: "Frontend & UX", keyword: "Web Performance", aliases: ["web performance", "performance optimization", "web vitals", "lighthouse"], prevalence: { aiEngineer: 15, automationEngineer: 10, developerPlusAi: 45 } },
  { category: "Ways of Working", keyword: "Agile & Scrum", aliases: ["agile", "scrum", "kanban"], prevalence: { aiEngineer: 25, automationEngineer: 40, developerPlusAi: 45 } },
  { category: "Ways of Working", keyword: "Mentoring & Onboarding", aliases: ["mentoring", "mentor", "onboarding"], prevalence: { aiEngineer: 22, automationEngineer: 18, developerPlusAi: 35 } },
  { category: "Security", keyword: "Authentication & Security", aliases: ["oauth", "authentication", "security"], prevalence: { aiEngineer: 15, automationEngineer: 12, developerPlusAi: 25 } },
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Frozen dataset rows in study order, with the overall-average column precomputed. */
export const MARKET_KEYWORDS: readonly (MarketKeywordRow & {
  prevalence: MarketKeywordRow["prevalence"] & { overallAverage: number };
})[] = ROWS.map((row) => ({
  ...row,
  prevalence: {
    ...row.prevalence,
    overallAverage: round1(
      (row.prevalence.aiEngineer +
        row.prevalence.automationEngineer +
        row.prevalence.developerPlusAi) /
        3,
    ),
  },
}));

/** Prevalence of a row for a role key (including the computed overall average). */
export function getPrevalence(
  row: (typeof MARKET_KEYWORDS)[number],
  role: MarketRoleKey,
): number {
  return row.prevalence[role];
}

/** Profile slug → role distribution used as its ATS scoring target. */
export const PROFILE_ROLE_TARGETS: Record<string, MarketRoleKey> = {
  "ai-engineer": "aiEngineer",
  "fullstack-engineer": "developerPlusAi",
  "product-engineer": "overallAverage",
};

/** Must-have threshold: keywords at or above this prevalence are "must-have" for a role. */
export const MUST_HAVE_PREVALENCE = 70;

/** Human-readable label for a role key. */
export const ROLE_LABELS: Record<MarketRoleKey, string> = {
  aiEngineer: "AI Engineer",
  automationEngineer: "Automation Engineer",
  developerPlusAi: "Developer + AI",
  overallAverage: "Overall Average",
};
