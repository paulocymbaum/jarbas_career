import type {
  LinkedInArticle,
  LinkedInImportSnapshot,
  LinkedInPost,
  LinkedInUserInfo,
} from "./types.js";
import type { LinkedInLiteProfile } from "./types.js";

function toIsoDate(timestamp?: number): string | undefined {
  if (!timestamp) {
    return undefined;
  }
  return new Date(timestamp).toISOString();
}

export function mapPostToArticle(post: LinkedInPost): LinkedInArticle | null {
  const article = post.content?.article;
  if (!article?.source) {
    return null;
  }

  return {
    id: post.id,
    title: article.title ?? post.commentary?.slice(0, 120) ?? "Untitled article",
    url: article.source,
    summary: article.description ?? post.commentary,
    publishedAt: toIsoDate(post.publishedAt ?? post.createdAt),
    thumbnailUrl: article.thumbnail,
  };
}

export function mapPostsToArticles(posts: LinkedInPost[]): LinkedInArticle[] {
  return posts.map(mapPostToArticle).filter((article): article is LinkedInArticle => article !== null);
}

export function buildProfileFromApi(input: {
  userInfo: LinkedInUserInfo;
  liteProfile?: LinkedInLiteProfile;
  vanityName?: string;
}): LinkedInImportSnapshot["profile"] {
  const { userInfo, liteProfile, vanityName } = input;
  const resolvedVanity = vanityName ?? liteProfile?.vanityName;
  const firstName = liteProfile?.localizedFirstName ?? userInfo.given_name ?? "";
  const lastName = liteProfile?.localizedLastName ?? userInfo.family_name ?? "";
  const name =
    userInfo.name?.trim() ||
    `${firstName} ${lastName}`.trim() ||
    "LinkedIn Member";

  return {
    name,
    email: userInfo.email,
    headline: liteProfile?.localizedHeadline,
    photoUrl: userInfo.picture,
    vanityName: resolvedVanity,
    linkedinUrl: resolvedVanity ? `https://www.linkedin.com/in/${resolvedVanity}` : undefined,
  };
}

export function createEmptySnapshot(memberUrn: string): LinkedInImportSnapshot {
  return {
    fetchedAt: new Date().toISOString(),
    memberUrn,
    profile: {
      name: "",
    },
    articles: [],
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    warnings: [],
    source: {
      profile: "unavailable",
      articles: "unavailable",
      curriculum: "unavailable",
    },
  };
}

/**
 * Maps LinkedIn API responses into the portfolio import snapshot.
 * Experience, education, skills, and certifications require partner-tier APIs
 * or a LinkedIn data export — those arrays stay empty unless populated elsewhere.
 */
export function buildImportSnapshot(input: {
  memberUrn: string;
  userInfo: LinkedInUserInfo;
  liteProfile?: LinkedInLiteProfile;
  posts?: LinkedInPost[];
  vanityName?: string;
  warnings?: string[];
}): LinkedInImportSnapshot {
  const snapshot = createEmptySnapshot(input.memberUrn);
  snapshot.profile = buildProfileFromApi({
    userInfo: input.userInfo,
    liteProfile: input.liteProfile,
    vanityName: input.vanityName,
  });
  snapshot.source.profile = "api";

  if (input.posts) {
    snapshot.articles = mapPostsToArticles(input.posts);
    snapshot.source.articles = snapshot.articles.length > 0 ? "api" : "unavailable";
  }

  snapshot.warnings = input.warnings ?? [];
  return snapshot;
}
