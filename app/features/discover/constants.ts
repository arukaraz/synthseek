import type {
  FeedQuery,
  PlaylistSetQuery,
  RecipeQuery,
  RecapQuery,
  WidgetDraft,
} from "@hooks/api/queries/widgets/types";

export const DEFAULT_RECAP: RecapQuery = { type: "recap", period: { mode: "named", value: "thisYear" } };

export const DEFAULT_QUERIES: { recipe: RecipeQuery; feed: FeedQuery } = {
  recipe: {
    type: "recipe",
    subject: "tracks",
    measure: "plays",
    time: { mode: "relative", days: 30 },
    pick: { by: "plays", order: "desc", limit: 10, random: null },
  },
  feed: {
    type: "feed",
    source: "lastfm.similarArtists",
    params: { seed: { kind: "myTopArtists", n: 10, days: 90 } },
    pick: { by: "rank", order: "asc", limit: 12, random: null },
  },
};

export const DEFAULT_PLAYLIST_SET: PlaylistSetQuery = {
  type: "playlists",
  slots: [
    { id: "slot-1", origin: "onRepeat", param: null, name: "", label: "On repeat", pinned: false },
    { id: "slot-2", origin: "rediscover", param: null, name: "", label: "Rediscover", pinned: false },
    { id: "slot-3", origin: "genre", param: "top:1", name: "", label: "My top 1", pinned: false },
    { id: "slot-4", origin: "genre", param: "top:2", name: "", label: "My top 2", pinned: false },
    { id: "slot-5", origin: "mood", param: "calm", name: "", label: "Calm", pinned: false },
    { id: "slot-6", origin: "deepCuts", param: null, name: "", label: "Deep cuts", pinned: false },
  ],
  mix: {
    length: { by: "tracks", value: 40 },
    perArtist: 2,
    perAlbum: 2,
    repeatWindow: "auto",
    dial: "balanced",
    order: "shuffle",
    minTracks: 8,
    distinct: true,
  },
  refresh: { every: "weekly", days: [0], dayOfMonth: 1, hour: 6, minute: 0, timeZone: "UTC" },
  onRefresh: { mode: "replace", keep: 8 },
  outside: { mode: "library", share: 20, expireWeeks: null },
  allow: [],
};

export const NEW_WIDGET_DRAFT: WidgetDraft = {
  kind: "synthseek-widget",
  schemaVersion: 2,
  meta: { name: "", description: "", icon: "sparkles", accent: "weekly", visibility: "private" },
  query: DEFAULT_QUERIES.recipe,
  view: { block: "list", action: "play" },
  defaultSize: "M",
  basedOn: null,
  playlist: null,
};
