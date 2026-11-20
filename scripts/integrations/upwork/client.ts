import type { UpworkConfig } from "./config.js";
import type {
  CreateEmploymentRecordInput,
  OtherExperienceInput,
  UpworkCurrentUser,
  UpworkEmploymentRecord,
  UpworkGraphQLResponse,
  UpworkOtherExperience,
  UpworkTokenResponse,
  UpdateEmploymentRecordInput,
  UpdateOtherExperienceInput,
} from "./types.js";

export class UpworkApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`Upwork API ${status}: ${body}`);
    this.name = "UpworkApiError";
    this.status = status;
    this.body = body;
  }
}

type GraphQLRequest = {
  query: string;
  variables?: Record<string, unknown>;
};

const CURRENT_USER_QUERY = `
  query currentUserProfile {
    user {
      id
      name
      email
      freelancerProfile {
        employmentRecords {
          id
          companyName
          jobTitle
          role
          startDate
          endDate
          description
          city
          country
        }
        otherExperiences {
          edges {
            node {
              id
              subject
              description
              active
            }
          }
        }
      }
    }
  }
`;

const ADD_EMPLOYMENT_MUTATION = `
  mutation addFreelancerEmploymentRecord($input: CreateEmploymentRecordInput!) {
    addFreelancerEmploymentRecord(input: $input) {
      id
      companyName
      jobTitle
      startDate
    }
  }
`;

const UPDATE_EMPLOYMENT_MUTATION = `
  mutation updateFreelancerEmploymentRecord($input: UpdateEmploymentRecordInput!) {
    updateFreelancerEmploymentRecord(input: $input) {
      id
      companyName
      jobTitle
      startDate
    }
  }
`;

const ADD_OTHER_EXPERIENCE_MUTATION = `
  mutation addFreelancerOtherExperience($input: OtherExperienceInput!) {
    addFreelancerOtherExperience(input: $input) {
      id
      subject
    }
  }
`;

const UPDATE_OTHER_EXPERIENCE_MUTATION = `
  mutation updateFreelancerOtherExperience($input: UpdateOtherExperienceInput!) {
    updateFreelancerOtherExperience(input: $input) {
      id
      subject
    }
  }
`;

type CurrentUserQueryData = {
  user: {
    id: string;
    name: string;
    email?: string | null;
    freelancerProfile?: {
      employmentRecords: UpworkEmploymentRecord[];
      otherExperiences?: {
        edges?: Array<{ node: UpworkOtherExperience } | null> | null;
      } | null;
    } | null;
  };
};

export class UpworkClient {
  private config: UpworkConfig;

  constructor(config: UpworkConfig) {
    this.config = config;
  }

  withTokens(tokens: Partial<UpworkConfig>): UpworkClient {
    return new UpworkClient({ ...this.config, ...tokens });
  }

  async exchangeAuthorizationCode(code: string): Promise<UpworkTokenResponse> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    return this.postToken(body);
  }

  async refreshAccessToken(): Promise<UpworkTokenResponse> {
    if (!this.config.refreshToken) {
      throw new Error("UPWORK_REFRESH_TOKEN is required to refresh the access token.");
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: this.config.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    return this.postToken(body);
  }

  private async postToken(body: URLSearchParams): Promise<UpworkTokenResponse> {
    const response = await fetch(this.config.oauthTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new UpworkApiError(response.status, text);
    }

    return JSON.parse(text) as UpworkTokenResponse;
  }

  private async ensureAccessToken(): Promise<string> {
    const token = this.config.accessToken;
    if (!token) {
      throw new Error("Access token required. Run npm run upwork:auth first.");
    }

    const expiresAt = this.config.tokenExpiresAt;
    if (expiresAt && this.config.refreshToken) {
      const expiresMs = Date.parse(expiresAt);
      if (!Number.isNaN(expiresMs) && expiresMs <= Date.now() + 60_000) {
        const refreshed = await this.refreshAccessToken();
        this.config = {
          ...this.config,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? this.config.refreshToken,
          tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        };
        return refreshed.access_token;
      }
    }

    return token;
  }

  private async graphql<T>(request: GraphQLRequest): Promise<T> {
    const accessToken = await this.ensureAccessToken();
    const response = await fetch(this.config.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new UpworkApiError(response.status, text);
    }

    const payload = JSON.parse(text) as UpworkGraphQLResponse<T>;
    if (payload.errors?.length) {
      throw new UpworkApiError(400, JSON.stringify(payload.errors));
    }

    if (!payload.data) {
      throw new UpworkApiError(400, "GraphQL response missing data");
    }

    return payload.data;
  }

  async fetchCurrentUser(): Promise<UpworkCurrentUser> {
    const data = await this.graphql<CurrentUserQueryData>({ query: CURRENT_USER_QUERY });
    const profile = data.user.freelancerProfile;

    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      freelancerProfile: profile
        ? {
            employmentRecords: profile.employmentRecords ?? [],
            otherExperiences:
              profile.otherExperiences?.edges
                ?.map((edge) => edge?.node)
                .filter((node): node is UpworkOtherExperience => Boolean(node)) ?? [],
          }
        : null,
    };
  }

  async addEmploymentRecord(input: CreateEmploymentRecordInput): Promise<UpworkEmploymentRecord> {
    const data = await this.graphql<{
      addFreelancerEmploymentRecord: UpworkEmploymentRecord;
    }>({
      query: ADD_EMPLOYMENT_MUTATION,
      variables: { input },
    });

    return data.addFreelancerEmploymentRecord;
  }

  async updateEmploymentRecord(input: UpdateEmploymentRecordInput): Promise<UpworkEmploymentRecord> {
    const data = await this.graphql<{
      updateFreelancerEmploymentRecord: UpworkEmploymentRecord;
    }>({
      query: UPDATE_EMPLOYMENT_MUTATION,
      variables: { input },
    });

    return data.updateFreelancerEmploymentRecord;
  }

  async addOtherExperience(input: OtherExperienceInput): Promise<UpworkOtherExperience> {
    const data = await this.graphql<{
      addFreelancerOtherExperience: UpworkOtherExperience;
    }>({
      query: ADD_OTHER_EXPERIENCE_MUTATION,
      variables: { input },
    });

    return data.addFreelancerOtherExperience;
  }

  async updateOtherExperience(input: UpdateOtherExperienceInput): Promise<UpworkOtherExperience> {
    const data = await this.graphql<{
      updateFreelancerOtherExperience: UpworkOtherExperience;
    }>({
      query: UPDATE_OTHER_EXPERIENCE_MUTATION,
      variables: { input },
    });

    return data.updateFreelancerOtherExperience;
  }
}
