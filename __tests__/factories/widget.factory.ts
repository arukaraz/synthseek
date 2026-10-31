import type {
  FeedWidgetResult,
  RecipeWidgetResult,
  RecapWidgetResult,
  WidgetCatalog,
  WidgetDocument,
  WidgetGrammar,
  WidgetPreset,
  WidgetRowOf,
} from "@hooks/api/queries/widgets/types";

type RecipeTrackRow = WidgetRowOf<RecipeWidgetResult, "tracks">;
type RecipeAlbumRow = WidgetRowOf<RecipeWidgetResult, "albums">;
type RecipeArtistRow = WidgetRowOf<RecipeWidgetResult, "artists">;
type RecipeBucketRow = WidgetRowOf<RecipeWidgetResult, "buckets">;
type RecipeSeriesRow = WidgetRowOf<RecipeWidgetResult, "series">;
type RecipeMatrixRow = WidgetRowOf<RecipeWidgetResult, "matrix">;
type FeedAlbumRow = WidgetRowOf<FeedWidgetResult, "albums">;
type FeedPlaylistRow = WidgetRowOf<FeedWidgetResult, "playlists">;

const WINDOW = { from: new Date("2026-09-29T00:00:00Z"), to: new Date("2026-10-29T00:00:00Z") };

export function createWidget(overrides: Partial<WidgetDocument> = {}): WidgetDocument {
  return {
    id: "w_1",
    kind: "synthseek-widget",
    schemaVersion: 2,
    meta: { name: "Most played", description: "Your month", icon: "flame", accent: "daily", visibility: "private" },
    query: {
      type: "recipe",
      subject: "tracks",
      measure: "plays",
      time: { mode: "relative", days: 30 },
      pick: { by: "plays", order: "desc", limit: 10, random: null },
    },
    view: { block: "list", action: "play" },
    defaultSize: "M",
    basedOn: null,
    playlist: null,
    ...overrides,
  };
}

export function createRecipeTrackRow(overrides: Partial<RecipeTrackRow> = {}): RecipeTrackRow {
  return {
    id: "t1",
    trackId: "req-1",
    title: "Song One",
    artist: "Artist A",
    album: "Album A",
    cover: null,
    durationMs: 200_000,
    plays: 12,
    playedAt: new Date("2026-10-28T20:00:00Z"),
    addedAt: new Date("2026-01-01T00:00:00Z"),
    bitrate: 320,
    inLibrary: true,
    favorite: false,
    value: 12,
    prev: null,
    ...overrides,
  };
}

export function createRecipeAlbumRow(overrides: Partial<RecipeAlbumRow> = {}): RecipeAlbumRow {
  return {
    id: "a1",
    albumExternalId: "dz-album-1",
    name: "Album One",
    artist: "Artist A",
    cover: null,
    year: 2024,
    releaseDate: "2024-05-17",
    tracks: 10,
    completedTracks: 10,
    status: "complete",
    plays: 30,
    playedAt: null,
    addedAt: new Date("2026-10-01T00:00:00Z"),
    inLibrary: true,
    favorite: false,
    value: 30,
    prev: null,
    ...overrides,
  };
}

export function createFeedAlbumRow(overrides: Partial<FeedAlbumRow> = {}): FeedAlbumRow {
  return {
    id: "f1",
    rank: 1,
    name: "Fresh One",
    artist: "Artist B",
    cover: null,
    releaseDate: "2026-11-07",
    year: 2026,
    releaseType: "album",
    catalogAlbumId: null,
    albumId: null,
    requestStatus: null,
    artistInLibrary: true,
    inLibrary: false,
    plays: 0,
    lastPlayed: null,
    favorite: false,
    listeners: null,
    ...overrides,
  };
}

const RECIPE_BASE = { type: "recipe", measure: "plays", window: WINDOW, previous: null, privacy: null } as const;

export function createTrackResult(rows: RecipeTrackRow[]): RecipeWidgetResult {
  return { ...RECIPE_BASE, subject: "tracks", total: rows.length, dataset: "tracks", shape: "ranked", rows };
}

export function createAlbumResult(rows: RecipeAlbumRow[]): RecipeWidgetResult {
  return { ...RECIPE_BASE, subject: "albums", total: rows.length, dataset: "albums", shape: "ranked", rows };
}

export function createArtistResult(rows: RecipeArtistRow[]): RecipeWidgetResult {
  return { ...RECIPE_BASE, subject: "artists", total: rows.length, dataset: "artists", shape: "ranked", rows };
}

export function createBucketResult(
  rows: RecipeBucketRow[],
  subject: "genres" | "decades" = "genres"
): RecipeWidgetResult {
  return { ...RECIPE_BASE, subject, total: rows.length, dataset: "buckets", shape: "buckets", rows };
}

export function createSeriesResult(
  rows: RecipeSeriesRow[],
  measure: RecipeWidgetResult["measure"] = "plays"
): RecipeWidgetResult {
  return { ...RECIPE_BASE, measure, subject: "tracks", total: rows.length, dataset: "series", shape: "series", rows };
}

export function createMatrixResult(rows: RecipeMatrixRow[]): RecipeWidgetResult {
  return { ...RECIPE_BASE, subject: "tracks", total: rows.length, dataset: "matrix", shape: "matrix", rows };
}

export function createNewsResult(
  rows: WidgetRowOf<FeedWidgetResult, "items">[],
  failure: Extract<FeedWidgetResult, { dataset: "items" }>["failure"] = null
): FeedWidgetResult {
  return {
    type: "feed",
    source: "feed.rss",
    needs: null,
    shape: "feedItems",
    dataset: "items",
    failure,
    total: rows.length,
    rows,
  };
}

export function createRecapResult(
  facts: RecapWidgetResult["facts"],
  overrides: Partial<RecapWidgetResult> = {}
): RecapWidgetResult {
  return {
    type: "recap",
    dataset: "facts",
    shape: "facts",
    window: WINDOW,
    plays: 120,
    minimumPlays: 20,
    covers: ["https://img.test/a.jpg", "https://img.test/b.jpg"],
    facts,
    ...overrides,
  };
}

export function createDailySeries(from: string, values: readonly number[]): RecipeSeriesRow[] {
  const start = new Date(`${from}T12:00:00Z`);
  return values.map((value, index) => {
    const day = new Date(start.getTime() + index * 86_400_000);
    return { key: day.toISOString().slice(0, 10), value, prev: null };
  });
}

export function createWidgetPreset(overrides: Partial<WidgetPreset> = {}): WidgetPreset {
  const { id: _id, ...draft } = createWidget();
  return { key: "topTracks", builtin: "topTracks", startFrom: true, draft, ...overrides };
}

export function createWidgetGrammar(): WidgetGrammar {
  return {
    subjects: [
      {
        key: "tracks",
        measures: ["plays", "minutes", "lastPlayed", "addedAt", "rankDelta"],
        rules: [
          { field: "plays", ops: ["gte", "lte"] },
          { field: "notPlayedInLast", ops: ["days"] },
          { field: "favorite", ops: ["is"] },
          { field: "inLibrary", ops: ["is"] },
          { field: "user", ops: ["is", "isNot", "with"] },
        ],
        groupBy: ["hour", "weekday", "day", "week", "month"],
      },
      {
        key: "albums",
        measures: ["plays", "minutes", "distinctTracks", "lastPlayed", "addedAt", "rankDelta"],
        rules: [
          { field: "plays", ops: ["gte", "lte"] },
          { field: "ownedShare", ops: ["lt", "gte"] },
        ],
        groupBy: [],
      },
      { key: "genres", measures: ["plays", "minutes", "distinctTracks", "rankDelta"], rules: [], groupBy: [] },
    ],
    groupByMeasures: ["plays", "minutes", "distinctTracks"],
    numericMeasures: ["plays", "minutes", "distinctTracks", "rankDelta"],
    namedPeriods: ["thisWeek", "thisMonth", "thisYear", "all"],
    pick: { orders: ["desc", "asc"], rotations: ["daily", "weekly"], limitMin: 1, limitMax: 50 },
    limits: { daysMax: 3650, topNMax: 50, rulesMax: 8, yearMin: 1900, yearMax: 2100 },
    subjectShapes: {
      tracks: { single: "ranked", many: "ranked" },
      albums: { single: "ranked", many: "ranked" },
      artists: { single: "ranked", many: "ranked" },
      genres: { single: "single", many: "buckets" },
      decades: { single: "single", many: "buckets" },
      requests: { single: "ranked", many: "ranked" },
    },
    groupByShapes: { hour: "matrix", weekday: "matrix", day: "series", week: "series", month: "series" },
    shapes: [
      { key: "ranked", limitApplies: true },
      { key: "single", limitApplies: true },
      { key: "series", limitApplies: false },
      { key: "matrix", limitApplies: false },
      { key: "buckets", limitApplies: true },
      { key: "facts", limitApplies: false },
    ],
  };
}

export function createWidgetCatalog(): WidgetCatalog {
  return {
    blocks: [
      { key: "list", shapes: ["ranked", "buckets"], needsCompare: false, needsNumbers: false },
      { key: "cards", shapes: ["ranked"], needsCompare: false, needsNumbers: false },
      { key: "rail", shapes: ["ranked"], needsCompare: false, needsNumbers: false },
      { key: "leader", shapes: ["ranked"], needsCompare: false, needsNumbers: false },
      { key: "mosaic", shapes: ["ranked"], needsCompare: false, needsNumbers: false },
      { key: "rankingMoves", shapes: ["ranked"], needsCompare: true, needsNumbers: false },
      { key: "stat", shapes: ["single"], needsCompare: false, needsNumbers: true },
      { key: "bars", shapes: ["series", "buckets"], needsCompare: false, needsNumbers: true },
      { key: "sparkline", shapes: ["series"], needsCompare: false, needsNumbers: false },
      { key: "yearCalendar", shapes: ["series"], needsCompare: false, needsNumbers: false },
      { key: "heatmap", shapes: ["matrix"], needsCompare: false, needsNumbers: false },
      { key: "share", shapes: ["buckets"], needsCompare: false, needsNumbers: true },
      { key: "compare", shapes: ["buckets"], needsCompare: true, needsNumbers: true },
      { key: "story", shapes: ["facts"], needsCompare: false, needsNumbers: false },
      { key: "feed", shapes: ["ranked", "feedItems"], needsCompare: false, needsNumbers: false },
    ],
    accents: ["daily", "weekly", "explore", "cf"],
    actions: ["play", "shuffle", "radio", "request", "open", "openUrl", "none"],
    icons: ["sparkles", "flame", "trophy", "heart", "music"],
    feeds: {
      sources: [
        {
          key: "lastfm.similarArtists",
          dataset: "artists",
          shape: "ranked",
          integration: "lastfm",
          params: ["seed"],
          rules: ["plays", "inLibrary"],
          pickBy: ["rank", "name", "plays"],
        },
        {
          key: "listenbrainz.freshReleases",
          dataset: "albums",
          shape: "ranked",
          integration: null,
          params: ["days"],
          rules: ["releaseType", "artistInLibrary"],
          pickBy: ["rank", "releaseDate"],
        },
        {
          key: "events.upcoming",
          dataset: "events",
          shape: "ranked",
          integration: "bandsintown",
          params: ["seed", "country", "days"],
          rules: [],
          pickBy: ["rank", "releaseDate"],
        },
        {
          key: "feed.rss",
          dataset: "items",
          shape: "feedItems",
          integration: null,
          params: ["url"],
          rules: [],
          pickBy: ["rank", "releaseDate"],
        },
        {
          key: "mediaServer.playlists",
          dataset: "playlists",
          shape: "ranked",
          integration: "mediaServer",
          params: ["server"],
          rules: [],
          pickBy: ["rank", "name"],
        },
        {
          key: "lidarr.calendar",
          dataset: "albums",
          shape: "ranked",
          integration: "lidarr",
          params: ["days"],
          rules: ["inLibrary", "releaseType"],
          pickBy: ["rank", "releaseDate"],
        },
      ],
      seeds: ["myTopArtists", "favorites", "artist", "playlist"],
      playlists: ["weekly-jams", "weekly-exploration", "daily-jams"],
      curated: ["pitchforkBestNewAlbums", "nprMusic"],
      servers: ["plex", "navidrome", "jellyfin"],
      defaultServer: "jellyfin",
      limits: { freshReleaseDaysMax: 90, eventsDaysMax: 180, lidarrCalendarDaysMax: 90 },
    },
    recap: {
      shape: "facts",
      namedPeriods: ["thisYear", "thisMonth"],
      facts: [
        "plays",
        "minutes",
        "topArtist",
        "topTrack",
        "topAlbums",
        "topGenres",
        "newArtists",
        "listeningAge",
        "busiestDay",
        "peakHour",
      ],
      minimumPlays: 20,
      yearMin: 1900,
      yearMax: 2100,
    },
    limits: { maxPerUser: 24, nameMaxLength: 60, descriptionMaxLength: 200, importMaxBytes: 16_384 },
  };
}

export function createFeedAlbumResult(rows: FeedAlbumRow[], needs: FeedWidgetResult["needs"] = null): FeedWidgetResult {
  return {
    type: "feed",
    source: "listenbrainz.freshReleases",
    needs,
    shape: "ranked",
    total: rows.length,
    dataset: "albums",
    rows,
  };
}

export function createServerPlaylistRow(overrides: Partial<FeedPlaylistRow> = {}): FeedPlaylistRow {
  return { id: "plex:r-1", rank: 1, name: "Road trip", tracks: 12, server: "plex", playlistId: "pl-1", ...overrides };
}

export function createServerPlaylistResult(rows: FeedPlaylistRow[]): FeedWidgetResult {
  return {
    type: "feed",
    source: "mediaServer.playlists",
    needs: null,
    shape: "ranked",
    total: rows.length,
    dataset: "playlists",
    rows,
  };
}
