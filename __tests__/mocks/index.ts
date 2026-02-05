export {
  mockNavigatorLanguage,
  mockNavigatorWithoutLanguage,
  clearNavigator,
  mockMatchMedia,
} from "./browser.mock";

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

export {
  mockRouter,
  mockSearchParams,
  mockPathname,
  createMockSearchParams,
  setupNextNavigationMocks,
  resetNextMocks,
  mockNextImage,
  mockNextLink,
} from "./next.mock.tsx";
