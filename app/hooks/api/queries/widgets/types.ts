import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

type WidgetOutputs = inferRouterOutputs<AppRouter>["widgets"];

export type WidgetDocument = WidgetOutputs["list"][number];
export type WidgetBlock = WidgetDocument["view"]["block"];
export type WidgetAction = WidgetDocument["view"]["action"];
export type WidgetAccent = WidgetDocument["meta"]["accent"];
export type WidgetIcon = WidgetDocument["meta"]["icon"];
export type WidgetCatalog = WidgetOutputs["catalog"];
export type WidgetGrammar = WidgetOutputs["grammar"];
export type WidgetQuery = WidgetDocument["query"];
export type RecipeQuery = Extract<WidgetQuery, { type: "recipe" }>;
export type FeedQuery = Extract<WidgetQuery, { type: "feed" }>;
export type RecapQuery = Extract<WidgetQuery, { type: "recap" }>;
export type RecapPeriod = RecapQuery["period"];
export type PlaylistSetQuery = Extract<WidgetQuery, { type: "playlists" }>;
export type SetSlot = PlaylistSetQuery["slots"][number];
export type SetGrammar = WidgetOutputs["setGrammar"];
export type SetListDetail = WidgetOutputs["setList"];
export type SetTrackRow = SetListDetail["tracks"][number];
export type SetSuggestion = SetListDetail["suggestions"][number];
export type SetNote = SetListDetail["notes"][number];
export type SetVeto = WidgetOutputs["veto"];
export type SetVetoTrack = WidgetOutputs["vetoTracks"][number];
export type WidgetDraft = Omit<WidgetDocument, "id">;
export type WidgetPreset = WidgetOutputs["presets"][number];
export type WidgetPresetKey = WidgetPreset["key"];
export type WidgetImportReport = WidgetOutputs["importPreview"];
export type WidgetProblem = Extract<WidgetImportReport, { ok: false }>["problems"][number]["problem"];
export type WidgetBindSlot = keyof NonNullable<WidgetDocument["view"]["bind"]>;
export type WidgetResult = WidgetOutputs["data"];
export type WidgetRuleOfPlaylist = WidgetOutputs["playlistRule"];
export type HouseholdMember = WidgetOutputs["household"][number];
export type RecipeWidgetResult = Extract<WidgetResult, { type: "recipe" }>;
export type FeedWidgetResult = Extract<WidgetResult, { type: "feed" }>;
export type RecapWidgetResult = Extract<WidgetResult, { type: "recap" }>;
export type PlaylistSetWidgetResult = Extract<WidgetResult, { type: "playlists" }>;
export type SetListResult = PlaylistSetWidgetResult["lists"][number];
export type RecapFact = RecapWidgetResult["facts"][number];
export type WidgetMeasure = RecipeWidgetResult["measure"];
export type WidgetShape = WidgetResult["shape"];
export type WidgetRowOf<R extends RecipeWidgetResult | FeedWidgetResult, D extends R["dataset"]> = Extract<
  R,
  { dataset: D }
>["rows"][number];
