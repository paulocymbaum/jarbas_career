// Deterministic keyword matcher for market-insight aliases.
// Word-boundary semantics via lookarounds so aliases like "c++" and "ci/cd" work,
// while "git" never matches inside "github" and bare "rest" never matches "restore".

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAliasPattern(alias: string): RegExp {
  const escaped = escapeRegExp(alias.trim().toLowerCase());
  const first = escaped.charAt(0);
  const last = escaped.charAt(escaped.length - 1);
  const startBoundary = /[\w]/.test(first) ? "(?<![\\w])" : "";
  const endBoundary = /[\w]/.test(last) ? "(?![\\w])" : "";
  return new RegExp(`${startBoundary}${escaped}${endBoundary}`, "i");
}

/**
 * Returns the aliases (in dataset order) that occur in `haystack`.
 * Case-insensitive, word-boundary aware, deterministic.
 */
export function matchAliases(haystack: string, aliases: readonly string[]): string[] {
  const patterns = aliases.map((alias) => ({ alias, pattern: buildAliasPattern(alias) }));
  const matched: string[] = [];

  for (const { alias, pattern } of patterns) {
    pattern.lastIndex = 0;
    if (pattern.test(haystack)) {
      matched.push(alias);
    }
  }

  return matched;
}
