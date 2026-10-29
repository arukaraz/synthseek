import type {
  FeedWidgetResult,
  QuestionWidgetResult,
  WidgetDocument,
  WidgetRowOf,
} from "@hooks/api/queries/widgets/types";

type QuestionTrackRow = WidgetRowOf<QuestionWidgetResult, "tracks">;
type QuestionAlbumRow = WidgetRowOf<QuestionWidgetResult, "albums">;
type QuestionBucketRow = WidgetRowOf<QuestionWidgetResult, "buckets">;
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
