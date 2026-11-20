export { UpworkClient, UpworkApiError } from "./client.js";
export {
  buildAuthorizationUrl,
  loadUpworkConfig,
  requireAccessToken,
  type UpworkConfig,
} from "./config.js";
export {
  buildSyncPlan,
  experienceMarker,
  mapExperienceRows,
  mapProjectRows,
  normalizeUpworkDate,
  parseLocation,
  printSyncPlan,
  projectMarker,
} from "./mapper.js";
export { createEmptySyncState, loadSyncState, saveSyncState } from "./sync-state.js";
export type {
  CreateEmploymentRecordInput,
  OtherExperienceInput,
  UpworkCurrentUser,
  UpworkEmploymentPayload,
  UpworkEmploymentRecord,
  UpworkOtherExperience,
  UpworkProjectPayload,
  UpworkSyncAction,
  UpworkSyncPlan,
  UpworkSyncSnapshot,
  UpworkSyncState,
  UpworkTokenResponse,
  UpdateEmploymentRecordInput,
  UpdateOtherExperienceInput,
} from "./types.js";
