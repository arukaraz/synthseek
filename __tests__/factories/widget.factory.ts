import type {
  FeedWidgetResult,
  QuestionWidgetResult,
  WidgetCatalog,
  WidgetDocument,
  WidgetGrammar,
  WidgetPreset,
  WidgetRowOf,
} from "@hooks/api/queries/widgets/types";

type QuestionTrackRow = WidgetRowOf<QuestionWidgetResult, "tracks">;
type QuestionAlbumRow = WidgetRowOf<QuestionWidgetResult, "albums">;
type QuestionBucketRow = WidgetRowOf<QuestionWidgetResult, "buckets">;
type QuestionSeriesRow = WidgetRowOf<QuestionWidgetResult, "series">;
type QuestionMatrixRow = WidgetRowOf<QuestionWidgetResult, "matrix">;
type FeedAlbumRow = WidgetRowOf<FeedWidgetResult, "albums">;

const WINDOW = { from: new Date("2026-09-29T00:00:00Z"), to: new Date("2026-10-29T00:00:00Z") };

export function createWidget(overrides: Partial<WidgetDocument> = {}): WidgetDocument {
  return {
    id: "w_1",
    kind: "synthseek-widget",
    schemaVersion: 2,
    meta: { name: "Most played", description: "Your month", icon: "flame", accent: "daily", visibility: "private" },
    query: {
      type: "question",
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

export function createQuestionTrackRow(overrides: Partial<QuestionTrackRow> = {}): QuestionTrackRow {
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

export function createQuestionAlbumRow(overrides: Partial<QuestionAlbumRow> = {}): QuestionAlbumRow {
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

const QUESTION_BASE = { type: "question", measure: "plays", window: WINDOW, previous: null } as const;

export function createTrackResult(rows: QuestionTrackRow[]): QuestionWidgetResult {
  return { ...QUESTION_BASE, subject: "tracks", total: rows.length, dataset: "tracks", shape: "ranked", rows };
}

export function createAlbumResult(rows: QuestionAlbumRow[]): QuestionWidgetResult {
  return { ...QUESTION_BASE, subject: "albums", total: rows.length, dataset: "albums", shape: "ranked", rows };
}

export function createBucketResult(
  rows: QuestionBucketRow[],
  subject: "genres" | "decades" = "genres"
): QuestionWidgetResult {
  return { ...QUESTION_BASE, subject, total: rows.length, dataset: "buckets", shape: "buckets", rows };
}

export function createSeriesResult(
  rows: QuestionSeriesRow[],
  measure: QuestionWidgetResult["measure"] = "plays"
): QuestionWidgetResult {
  return { ...QUESTION_BASE, measure, subject: "tracks", total: rows.length, dataset: "series", shape: "series", rows };
}

export function createMatrixResult(rows: QuestionMatrixRow[]): QuestionWidgetResult {
  return { ...QUESTION_BASE, subject: "tracks", total: rows.length, dataset: "matrix", shape: "matrix", rows };
}

export function createDailySeries(from: string, values: readonly number[]): QuestionSeriesRow[] {
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
    ],
  };
}

export function createWidgetCatalog(): WidgetCatalog {
  return {
    blocks: [
      { key: "list", shapes: ["ranked", "buckets"], needsCompare: false },
      { key: "cards", shapes: ["ranked"], needsCompare: false },
      { key: "rail", shapes: ["ranked"], needsCompare: false },
      { key: "leader", shapes: ["ranked"], needsCompare: false },
      { key: "mosaic", shapes: ["ranked"], needsCompare: false },
      { key: "rankingMoves", shapes: ["ranked"], needsCompare: true },
      { key: "stat", shapes: ["single"], needsCompare: false },
      { key: "bars", shapes: ["series", "buckets"], needsCompare: false },
      { key: "sparkline", shapes: ["series"], needsCompare: false },
      { key: "yearCalendar", shapes: ["series"], needsCompare: false },
      { key: "heatmap", shapes: ["matrix"], needsCompare: false },
      { key: "share", shapes: ["buckets"], needsCompare: false },
      { key: "compare", shapes: ["buckets"], needsCompare: true },
    ],
    accents: ["daily", "weekly", "explore", "cf"],
    actions: ["play", "request", "open", "none"],
    icons: ["sparkles", "flame", "trophy", "heart", "music"],
    feeds: {
      sources: [
        {
          key: "lastfm.similarArtists",
          dataset: "artists",
          integration: "lastfm",
          params: ["seed"],
          rules: ["plays", "inLibrary"],
          pickBy: ["rank", "name", "plays"],
        },
        {
          key: "listenbrainz.freshReleases",
          dataset: "albums",
          integration: null,
          params: ["days"],
          rules: ["releaseType", "artistInLibrary"],
          pickBy: ["rank", "releaseDate"],
        },
      ],
      seeds: ["myTopArtists", "favorites", "artist", "playlist"],
      playlists: ["weekly-jams", "weekly-exploration", "daily-jams"],
      shape: "ranked",
      limits: { freshReleaseDaysMax: 90 },
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
