import type { FeedQuery, RecipeQuery, RecapQuery, WidgetDraft } from "@hooks/api/queries/widgets/types";

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
