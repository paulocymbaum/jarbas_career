/** OAuth token response from Upwork. */
export type UpworkTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
};

export type UpworkGraphQLError = {
  message: string;
  path?: string[];
  extensions?: Record<string, unknown>;
};

export type UpworkGraphQLResponse<T> = {
  data?: T;
  errors?: UpworkGraphQLError[];
};

export type UpworkEmploymentRecord = {
  id: string;
  companyName: string;
  jobTitle: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  city: string;
  country: string;
};

export type UpworkOtherExperience = {
  id: string;
  subject: string;
  description: string;
  active?: boolean | null;
};

export type UpworkFreelancerProfile = {
  employmentRecords: UpworkEmploymentRecord[];
  otherExperiences: UpworkOtherExperience[];
};

export type UpworkCurrentUser = {
  id: string;
  name: string;
  email?: string | null;
  freelancerProfile?: UpworkFreelancerProfile | null;
};

export type CreateEmploymentRecordInput = {
  companyName: string;
  jobTitle: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
  city: string;
  country: string;
};

export type UpdateEmploymentRecordInput = {
  id: string;
  companyName?: string;
  jobTitle?: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  city?: string;
  country?: string;
};

export type OtherExperienceInput = {
  subject: string;
  description: string;
  active?: boolean;
};

export type UpdateOtherExperienceInput = {
  id: string;
  subject?: string;
  description?: string;
  active?: boolean;
};

export type UpworkEmploymentPayload = {
  portfolioId: number;
  marker: string;
  input: CreateEmploymentRecordInput;
  matchKey: string;
};

export type UpworkProjectPayload = {
  portfolioSlug: string;
  marker: string;
  input: OtherExperienceInput;
  matchKey: string;
};

export type UpworkSyncAction =
  | { kind: "employment"; action: "create" | "update" | "skip"; portfolioId: number; upworkId?: string; input: CreateEmploymentRecordInput | UpdateEmploymentRecordInput }
  | { kind: "project"; action: "create" | "update" | "skip"; portfolioSlug: string; upworkId?: string; input: OtherExperienceInput | UpdateOtherExperienceInput };

export type UpworkSyncPlan = {
  userId: string;
  userName: string;
  actions: UpworkSyncAction[];
  warnings: string[];
};

export type UpworkSyncState = {
  version: 1;
  updatedAt: string;
  userId?: string;
  experience: Record<string, { upworkId: string; syncedAt: string }>;
  projects: Record<string, { upworkId: string; syncedAt: string }>;
};

export type UpworkSyncSnapshot = {
  syncedAt: string;
  dryRun: boolean;
  user: { id: string; name: string };
  plan: UpworkSyncPlan;
  results?: Array<{ kind: string; action: string; id?: string; portfolioRef: string }>;
};
