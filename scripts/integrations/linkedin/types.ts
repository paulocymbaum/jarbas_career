/** OpenID Connect userinfo (Sign In with LinkedIn). */
export type LinkedInUserInfo = {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  email?: string;
  email_verified?: boolean;
};

/** Lite profile from GET /v2/me (fields depend on granted scopes). */
export type LinkedInLiteProfile = {
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  localizedHeadline?: string;
  vanityName?: string;
  profilePicture?: {
    displayImage?: string;
  };
};

/** OAuth token response. */
export type LinkedInTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
};

/** Post / article from LinkedIn Posts API (subset of fields). */
export type LinkedInPost = {
  id: string;
  author: string;
  commentary?: string;
  createdAt?: number;
  publishedAt?: number;
  lifecycleState?: string;
  visibility?: string;
  content?: {
    article?: {
      source: string;
      title?: string;
      description?: string;
      thumbnail?: string;
    };
    media?: {
      id?: string;
      title?: string;
    };
  };
};

export type LinkedInPostsPage = {
  elements: LinkedInPost[];
  paging?: {
    start: number;
    count: number;
    total?: number;
  };
};

/** Normalized snapshot written to data/linkedin/ before DB import. */
export type LinkedInImportSnapshot = {
  fetchedAt: string;
  memberUrn: string;
  profile: {
    name: string;
    email?: string;
    headline?: string;
    photoUrl?: string;
    vanityName?: string;
    linkedinUrl?: string;
  };
  articles: LinkedInArticle[];
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
  certifications: LinkedInCertification[];
  warnings: string[];
  source: {
    profile: "api" | "data_export" | "unavailable";
    articles: "api" | "data_export" | "unavailable";
    curriculum: "api" | "data_export" | "unavailable";
  };
};

export type LinkedInArticle = {
  id: string;
  title: string;
  url: string;
  summary?: string;
  publishedAt?: string;
  thumbnailUrl?: string;
};

export type LinkedInExperience = {
  role: string;
  company: string;
  start?: string;
  end?: string | null;
  location?: string;
  summary?: string;
};

export type LinkedInEducation = {
  institution: string;
  degree: string;
  field?: string;
  start?: string;
  end?: string | null;
  summary?: string;
};

export type LinkedInCertification = {
  name: string;
  issuer: string;
  issuedDate?: string;
  expiryDate?: string | null;
  credentialId?: string;
  verifyUrl?: string;
};
