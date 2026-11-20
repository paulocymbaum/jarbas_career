import type { SkillCategory } from "@/content/types";

export type SkillDomainId =
  | "software-development"
  | "infrastructure"
  | "business"
  | "ux-ui"
  | "ai";

export type SkillDomain = {
  id: SkillDomainId;
  label: string;
  shortLabel: string;
  color: string;
  fill: string;
};

export const SKILL_DOMAINS: SkillDomain[] = [
  {
    id: "software-development",
    label: "Software Development",
    shortLabel: "Software",
    color: "hsl(217 71% 40%)",
    fill: "hsla(217, 71%, 40%, 0.08)",
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    shortLabel: "Infra",
    color: "hsl(199 70% 36%)",
    fill: "hsla(199, 70%, 36%, 0.10)",
  },
  {
    id: "business",
    label: "Business",
    shortLabel: "Business",
    color: "hsl(222 30% 32%)",
    fill: "hsla(222, 30%, 32%, 0.08)",
  },
  {
    id: "ux-ui",
    label: "UX/UI",
    shortLabel: "UX/UI",
    color: "hsl(205 65% 42%)",
    fill: "hsla(205, 65%, 42%, 0.10)",
  },
  {
    id: "ai",
    label: "AI",
    shortLabel: "AI",
    color: "hsl(231 55% 48%)",
    fill: "hsla(231, 55%, 48%, 0.10)",
  },
];

const DOMAIN_MATCHERS: Record<SkillDomainId, RegExp[]> = {
  ai: [
    /\bai\b/i,
    /llm/i,
    /rag/i,
    /langchain/i,
    /prompt/i,
    /generative/i,
    /nlp/i,
    /chatgpt/i,
    /chatbot/i,
    /mcp/i,
    /agentic/i,
    /fine-tun/i,
    /llmops/i,
    /transformer/i,
    /embedding/i,
    /notebooklm/i,
    /manus/i,
    /cursor ai/i,
    /responsible ai/i,
    /context engineer/i,
    /text generation/i,
    /integrated ai/i,
  ],
  infrastructure: [
    /devops/i,
    /\bci\/?cd\b/i,
    /continuous integration/i,
    /terraform/i,
    /ansible/i,
    /jenkins/i,
    /gitlab/i,
    /harness engineering/i,
    /automation tools/i,
    /system admin/i,
    /\bbash\b/i,
    /database/i,
    /postgresql/i,
    /nosql/i,
    /supabase/i,
    /firebase/i,
    /etl/i,
    /data engineering/i,
    /data extraction/i,
    /data management/i,
    /vectorization/i,
    /back-end operations/i,
    /performance/i,
    /git\b/i,
    /github/i,
    /internet of things/i,
    /\biot\b/i,
  ],
  "ux-ui": [
    /\bux\b/i,
    /\bui\b/i,
    /design system/i,
    /atomic design/i,
    /design thinking/i,
    /lean ux/i,
    /user (experience|research|interface)/i,
    /prototyp/i,
    /gamification/i,
    /learning experience design/i,
    /ux\/ui/i,
  ],
  business: [
    /business/i,
    /product (management|strategy|marketing|launch|leadership|discovery|requirements|road|lifecycle|vision|development|led)/i,
    /crm/i,
    /marketing/i,
    /stakeholder/i,
    /kpi/i,
    /key performance/i,
    /churn/i,
    /competitive analysis/i,
    /market research/i,
    /brand development/i,
    /inbound marketing/i,
    /onboarding/i,
    /customer (success|support)/i,
    /people management/i,
    /edtech/i,
    /saas/i,
    /paas/i,
    /erp/i,
    /hrtech/i,
    /lms/i,
    /language learning/i,
    /learning (management|path)/i,
    /project (management|planning)/i,
    /agile/i,
    /waterfall/i,
    /scrum/i,
    /kanban/i,
    /requirements analysis/i,
    /business insights/i,
    /business metrics/i,
    /business logic/i,
    /business vision/i,
    /leadership/i,
    /mentoring/i,
    /communication/i,
    /collaboration/i,
    /teamwork/i,
    /autonomy/i,
    /ownership/i,
    /proactivity/i,
    /problem solving/i,
    /resilience/i,
    /stakeholder relations/i,
    /cross-functional/i,
    /attention to detail/i,
    /systems thinking/i,
    /mature posture/i,
    /sense of priority/i,
    /research skills/i,
    /educational technology/i,
    /portugu[eê]s/i,
    /ingl[eê]s/i,
    /espanhol/i,
    /analytics/i,
    /data analysis/i,
    /statistics/i,
    /jira/i,
  ],
  "software-development": [
    /react/i,
    /typescript/i,
    /javascript/i,
    /python/i,
    /flutter/i,
    /flutterflow/i,
    /c\+\+/i,
    /programming/i,
    /software development/i,
    /full-stack/i,
    /web (development|applications)/i,
    /mobile app/i,
    /api/i,
    /rest/i,
    /graphql/i,
    /testing/i,
    /test automation/i,
    /qa automation/i,
    /unit & integration/i,
    /debugging/i,
    /troubleshooting/i,
    /clean code/i,
    /code review/i,
    /solid/i,
    /architecture best practices/i,
    /object-oriented/i,
    /\boop\b/i,
    /state management/i,
    /no-code/i,
    /low-code/i,
    /automation(?! tools)/i,
    /skill development/i,
  ],
};

function classifySkill(label: string): SkillDomainId {
  const order: SkillDomainId[] = ["ai", "infrastructure", "ux-ui", "business", "software-development"];

  for (const domainId of order) {
    if (DOMAIN_MATCHERS[domainId].some((pattern) => pattern.test(label))) {
      return domainId;
    }
  }

  return "software-development";
}

function getMatchingDomains(text: string): SkillDomainId[] {
  return (Object.keys(DOMAIN_MATCHERS) as SkillDomainId[]).filter((domainId) =>
    DOMAIN_MATCHERS[domainId].some((pattern) => pattern.test(text)),
  );
}

export function classifyProjectDomains(project: {
  title: string;
  description: string;
  tech: string[];
}): SkillDomain[] {
  const domainIds = new Set<SkillDomainId>();

  for (const source of [project.title, project.description, ...project.tech]) {
    for (const domainId of getMatchingDomains(source)) {
      domainIds.add(domainId);
    }
  }

  if (domainIds.size === 0) {
    domainIds.add("software-development");
  }

  return SKILL_DOMAINS.filter((domain) => domainIds.has(domain.id));
}

export type SkillDomainSummary = SkillDomain & {
  skills: string[];
  count: number;
  score: number;
};

export function buildSkillDomainSummaries(skills: SkillCategory[]): SkillDomainSummary[] {
  const buckets = new Map<SkillDomainId, Set<string>>(
    SKILL_DOMAINS.map((domain) => [domain.id, new Set<string>()]),
  );

  for (const category of skills) {
    for (const item of category.items) {
      const domainId = classifySkill(item);
      buckets.get(domainId)?.add(item);
    }
  }

  const counts = SKILL_DOMAINS.map((domain) => buckets.get(domain.id)?.size ?? 0);
  const maxCount = Math.max(...counts, 1);

  return SKILL_DOMAINS.map((domain) => {
    const domainSkills = [...(buckets.get(domain.id) ?? [])].sort((a, b) => a.localeCompare(b));
    const count = domainSkills.length;

    return {
      ...domain,
      skills: domainSkills,
      count,
      score: count / maxCount,
    };
  });
}
