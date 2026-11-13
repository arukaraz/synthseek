import { throttledInvalidation } from "./throttledInvalidation";

const libraryViews = throttledInvalidation((utils) => {
  void utils.library.getAlbums.invalidate();
  void utils.library.getArtists.invalidate();
  void utils.library.getPlaylists.invalidate();
  void utils.library.getTracks.invalidate();
  void utils.library.getCounts.invalidate();
});

const librarySummary = throttledInvalidation((utils) => {
  void utils.requests.getLibrarySummary.invalidate();
});

const keptReleases = throttledInvalidation((utils) => {
  void utils.requests.keptReleases.invalidate();
});

export const invalidateLibraryViews = libraryViews.run;

export const invalidateLibraryViewsNow = libraryViews.runNow;

export const invalidateLibrarySummary = librarySummary.run;

export const invalidateLibrarySummaryNow = librarySummary.runNow;

export const invalidateKeptReleases = keptReleases.run;
