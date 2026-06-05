import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@api/__generated__/types";

import { createMockMutation, createMockQuery } from "./trpc.mock";
import type { MockMutationResult, MockQueryResult } from "./trpc.mock";

type RouterOutputs = inferRouterOutputs<AppRouter>;

type SettingsOutput = RouterOutputs["settings"]["get"];
type UsersOutput = RouterOutputs["users"]["list"];
type JobsOutput = RouterOutputs["jobs"]["list"];
type LogTailOutput = RouterOutputs["logs"]["tail"];
type ApiKeysOutput = RouterOutputs["apiKeys"]["list"];
type SlskdStatusOutput = RouterOutputs["settings"]["slskdStatus"];
type LidarrStatusOutput = RouterOutputs["settings"]["lidarrStatus"];
type SpotifyConnectionOutput = RouterOutputs["librarySource"]["spotify"]["getConnectionStatus"];
type SpotifyLibraryItemsOutput = RouterOutputs["librarySource"]["spotify"]["listLibraryItems"];
type LibrarySubscriptionOutput = RouterOutputs["librarySource"]["subscription"]["get"];
type ImportPreviewOutput = RouterOutputs["portability"]["previewImport"];

export function createMockSettings(overrides: Partial<SettingsOutput> = {}): SettingsOutput {
  return {
    connections: {
      slskd: { apiUrl: "", apiKey: "", bannedUsers: [] },
      plex: { url: "", token: "" },
      lidarr: { url: "", apiKey: "" },
      enrichment: {
        lastfmApiKey: "",
        fanartApiKey: "",
        songlinkApiKey: "",
        acoustidApiKey: "",
        musicbrainzEmail: "",
      },
      spotify: { enabled: false, clientId: "", publicBaseUrl: "" },
    },
    engine: {
      queue: { maxSize: 100, maxConcurrentSearches: 3, maxPendingImports: 5 },
      search: {
        maxPeerAttempts: 5,
        maxVariations: 3,
        historyCleanupEnabled: true,
        maxHistorySearches: 50,
        banAfterFailedAttempts: 3,
      },
      timeouts: {
        searchPhase: 60,
        downloadPhase: 600,
        importPhase: 120,
        peerUnresponsive: 30,
        queueWaitActivePeer: 15,
        queueWaitIdlePeer: 30,
      },
      import: { metadataConfidenceThreshold: 0.8 },
      plexBehavior: { libraryScan: true, playlistSync: true },
      smartSearch: { customMoodKeywords: [], federatedPatternsEnabled: false },
    },
    formatting: {
      plexPlaylistUsernameAffix: "prefix",
      plexPlaylistUsernameSeparator: " - ",
    },
    library: { syncIntervalMinutes: 60 },
    downloadSources: {
      slskd: { enabled: true, priority: 1 },
      ytdlp: { enabled: false, priority: 2, searchResults: 5, maxDurationDeltaSec: 10 },
    },
    system: {
      wizardCompleted: true,
      migrationCompleted: true,
      instanceId: "instance-001",
      logLevel: "INFO",
    },
    ...overrides,
  };
}

export const createMockUseSettings = (
  overrides: Partial<MockQueryResult<SettingsOutput>> = {}
): MockQueryResult<SettingsOutput> => createMockQuery(createMockSettings(), overrides);

export function createMockUser(overrides: Partial<UsersOutput[number]> = {}): UsersOutput[number] {
  return {
    id: "user-001",
    email: "member@example.com",
    username: "member",
    avatar_url: null,
    role: "member",
    language: "en",
    plex_username: null,
    plexLinked: false,
    hasPassword: true,
    created_at: new Date("2024-01-01T00:00:00Z"),
    requestCount: 0,
    isOwner: false,
    isPlexUser: false,
    ...overrides,
  };
}

export const createMockUseUsers = (
  users: UsersOutput = [createMockUser()],
  overrides: Partial<MockQueryResult<UsersOutput>> = {}
): MockQueryResult<UsersOutput> => createMockQuery(users, overrides);

export function createMockJob(overrides: Partial<JobsOutput[number]> = {}): JobsOutput[number] {
  return {
    id: "library-sync",
    name: "Library Sync",
    description: "Sync the library",
    intervalMs: 3600000,
    nextRun: new Date("2024-01-01T01:00:00Z"),
    lastRun: new Date("2024-01-01T00:00:00Z"),
    lastStatus: "success",
    ...overrides,
  };
}

export const createMockUseJobs = (
  jobs: JobsOutput = [createMockJob()],
  overrides: Partial<MockQueryResult<JobsOutput>> = {}
): MockQueryResult<JobsOutput> => createMockQuery(jobs, overrides);

export function createMockLogEntry(
  overrides: Partial<LogTailOutput["entries"][number]> = {}
): LogTailOutput["entries"][number] {
  return {
    raw: "[INFO] application started",
    level: "INFO",
    requestId: null,
    ...overrides,
  };
}

export const createMockUseLogTail = (
  overrides: Partial<LogTailOutput> = {},
  queryOverrides: Partial<MockQueryResult<LogTailOutput>> = {}
): MockQueryResult<LogTailOutput> =>
  createMockQuery({ file: "synthseek.log", entries: [createMockLogEntry()], ...overrides }, queryOverrides);

export function createMockApiKey(overrides: Partial<ApiKeysOutput[number]> = {}): ApiKeysOutput[number] {
  return {
    id: "key-001",
    name: "CLI key",
    prefix: "ssk_abcd",
    last_used_at: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  };
}

export const createMockUseApiKeys = (
  keys: ApiKeysOutput = [createMockApiKey()],
  overrides: Partial<MockQueryResult<ApiKeysOutput>> = {}
): MockQueryResult<ApiKeysOutput> => createMockQuery(keys, overrides);

export const createMockUseSlskdStatus = (
  overrides: Partial<SlskdStatusOutput> = {},
  queryOverrides: Partial<MockQueryResult<SlskdStatusOutput>> = {}
): MockQueryResult<SlskdStatusOutput> =>
  createMockQuery({ configured: true, status: "healthy", ...overrides }, queryOverrides);

export const createMockUseLidarrStatus = (
  overrides: Partial<LidarrStatusOutput> = {},
  queryOverrides: Partial<MockQueryResult<LidarrStatusOutput>> = {}
): MockQueryResult<LidarrStatusOutput> =>
  createMockQuery({ configured: true, status: "healthy", ...overrides }, queryOverrides);

export const createMockUseSpotifyConnectionStatus = (
  overrides: Partial<SpotifyConnectionOutput> = {},
  queryOverrides: Partial<MockQueryResult<SpotifyConnectionOutput>> = {}
): MockQueryResult<SpotifyConnectionOutput> =>
  createMockQuery(
    {
      connected: false,
      pending: false,
      externalUsername: null,
      externalUserId: null,
      scopes: [],
      expiresAt: null,
      ...overrides,
    },
    queryOverrides
  );

export function createMockLibraryItem(
  overrides: Partial<SpotifyLibraryItemsOutput[number]> = {}
): SpotifyLibraryItemsOutput[number] {
  return {
    id: "library-item-001",
    type: "playlist",
    name: "Test Playlist",
    subtitle: "12 tracks",
    image: null,
    totalTracks: 12,
    externalUrl: "https://open.spotify.com/playlist/library-item-001",
    imported: false,
    syncEnabled: false,
    lastSyncedAt: null,
    localId: null,
    ...overrides,
  };
}

export const createMockUseSpotifyLibraryItems = (
  items: SpotifyLibraryItemsOutput = [createMockLibraryItem()],
  overrides: Partial<MockQueryResult<SpotifyLibraryItemsOutput>> = {}
): MockQueryResult<SpotifyLibraryItemsOutput> => createMockQuery(items, overrides);

export const createMockUseLibrarySubscription = (
  data: LibrarySubscriptionOutput = null,
  overrides: Partial<MockQueryResult<LibrarySubscriptionOutput>> = {}
): MockQueryResult<LibrarySubscriptionOutput> => createMockQuery(data, overrides);

export function createMockImportPreview(overrides: Partial<ImportPreviewOutput> = {}): ImportPreviewOutput {
  return {
    collections: [
      {
        name: "Imported Playlist",
        type: "playlist",
        total: 2,
        matched: 1,
        unmatched: 1,
        alreadyInLibrary: 0,
        tracks: [
          {
            title: "Matched Track",
            artist: "Test Artist",
            image: null,
            durationMs: 180000,
            matched: true,
            alreadyInLibrary: false,
            method: "isrc",
          },
          {
            title: "Unmatched Track",
            artist: "Other Artist",
            image: null,
            durationMs: 200000,
            matched: false,
            alreadyInLibrary: false,
            method: "none",
          },
        ],
      },
    ],
    ...overrides,
  };
}

export const createMockImportPreviewMutation = (
  data: ImportPreviewOutput | undefined = undefined,
  overrides: Partial<MockMutationResult> = {}
): MockMutationResult & { data: ImportPreviewOutput | undefined } => ({
  ...createMockMutation(overrides),
  data,
});
