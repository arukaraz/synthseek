export { mockNavigatorLanguage, mockNavigatorWithoutLanguage, clearNavigator, mockMatchMedia } from "./browser.mock";

export {
  createMockUseRequest,
  createMockUseAlbum,
  createMockUseLibrarySummary,
  createMockUseCategories,
  createMockUseTrendingTracks,
  createMockUseArtistSpotlight,
  createMockUseSearchContent,
} from "./hooks.mock";

export {
  createMockSettings,
  createMockUseSettings,
  createMockUser,
  createMockUseUsers,
  createMockJob,
  createMockUseJobs,
  createMockLogEntry,
  createMockUseLogTail,
  createMockApiKey,
  createMockUseApiKeys,
  createMockUseSlskdStatus,
  createMockUseLidarrStatus,
  createMockUseSpotifyConnectionStatus,
  createMockLibraryItem,
  createMockUseSpotifyLibraryItems,
  createMockUseLibrarySubscription,
  createMockImportPreview,
  createMockImportPreviewMutation,
} from "./feature-hooks.mock";

export {
  createMockQuery,
  createMockMutation,
  createLoadingQuery,
  createErrorQuery,
  createSuccessMutation,
  createPendingMutation,
  createErrorMutation,
  createMockTrpcUtils,
} from "./trpc.mock";

export type { MockQueryResult, MockMutationResult } from "./trpc.mock";

export { mockRouter, mockSearchParams, mockPathname, createMockSearchParams, resetNextMocks } from "./next.mock.tsx";
