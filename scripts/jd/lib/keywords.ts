// Deterministic JD keyword extraction on top of the market keyword dataset
// (scripts/lib/scoring/market-insights.ts) — same alias vocabulary the site audit uses.

import { MARKET_KEYWORDS } from "../../lib/scoring/market-insights.js";
import { matchAliases } from "../../lib/scoring/keyword-match.js";
import type { ParsedJd } from "./jd-parse.js";
import type { JdKeyword } from "./types.js";

/**
 * Extracts candidate keywords from a parsed JD.
 * Weight: 3 when the keyword appears in the role title or requirements/must-have
 * sections, 2 in responsibilities/nice-to-have, 1 elsewhere in the posting.
 * Stable sort: weight desc, then dataset order.
 */
export function extractKeywords(jd: ParsedJd): JdKeyword[] {
  const requirementsText = jd.sections.requirements.join("\n");
  const responsibilitiesText = jd.sections.responsibilities.join("\n");
  const niceToHaveText = jd.sections.niceToHave.join("\n");

  const rows: JdKeyword[] = [];

  for (const row of MARKET_KEYWORDS) {
    const inTitle = matchAliases(jd.role, row.aliases).length > 0;
    const inRequirements = matchAliases(requirementsText, row.aliases).length > 0;
    const inResponsibilities = matchAliases(responsibilitiesText, row.aliases).length > 0;
    const inNiceToHave = matchAliases(niceToHaveText, row.aliases).length > 0;
    const inBody = matchAliases(jd.text, row.aliases).length > 0;

    if (!inTitle && !inRequirements && !inResponsibilities && !inNiceToHave && !inBody) continue;

    let weight: 1 | 2 | 3 = 1;
    let origin: JdKeyword["origin"] = "other";
    if (inTitle || inRequirements) {
      weight = 3;
      origin = inTitle ? "title" : "must-have";
    } else if (inResponsibilities || inNiceToHave) {
      weight = 2;
      origin = "responsibility";
    }

    rows.push({ term: row.keyword, weight, aliases: [...row.aliases], origin });
  }

  return rows.sort((a, b) => b.weight - a.weight);
}
