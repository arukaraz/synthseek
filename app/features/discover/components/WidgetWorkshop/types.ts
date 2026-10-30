import type { ReactNode } from "react";

import type { BoardSize } from "@hooks/api/queries/board/types";
import type {
  FeedQuery,
  HouseholdMember,
  RecipeQuery,
  RecapPeriod,
  RecapQuery,
  WidgetAccent,
  WidgetAction,
  WidgetBlock,
  WidgetCatalog,
  WidgetDraft,
  WidgetGrammar,
  WidgetIcon,
  WidgetPreset,
  WidgetQuery,
  WidgetResult,
} from "@hooks/api/queries/widgets/types";

export type WidgetKind = "recipe" | "feed";
export type WorkshopSubject = RecipeQuery["subject"] | "recap";
export type RecapNamedPeriod = Extract<RecapPeriod, { mode: "named" }>["value"];
export type RecipeTime = RecipeQuery["time"];
export type RecipeSubject = RecipeQuery["subject"];
export type RecipeMeasure = RecipeQuery["measure"];
export type RecipeGroupBy = NonNullable<RecipeQuery["groupBy"]>;
export type WidgetRules = NonNullable<RecipeQuery["rules"]>;
export type WidgetRule = NonNullable<WidgetRules["all"]>[number];
export type RuleField = WidgetRule["field"];
export type RuleMode = "all" | "any";
export type GrammarSubject = WidgetGrammar["subjects"][number];
export type TimeMode = RecipeTime["mode"];
export type NamedPeriod = Extract<RecipeTime, { mode: "named" }>["value"];
export type FeedSource = FeedQuery["source"];
export type FeedSeed = Extract<FeedQuery, { source: "lastfm.similarArtists" }>["params"]["seed"];
export type FeedSeedKind = "myTopArtists" | "favorites";
export type ListenBrainzPlaylist = Extract<FeedQuery, { source: "listenbrainz.playlists" }>["params"]["playlist"];
export type FeedPickBy = FeedQuery["pick"]["by"];
export type CuratedFeed = Extract<FeedQuery, { source: "feed.curated" }>["params"]["feed"];
export type CatalogFeedSource = WidgetCatalog["feeds"]["sources"][number];
export type MediaServer = Extract<FeedQuery, { source: "mediaServer.playlists" }>["params"]["server"];

export interface FeedDefaults {
  seed: FeedSeed;
  country: string;
  server: MediaServer;
}

export interface FeedBase {
  type: "feed";
  rules: WidgetRules | undefined;
  pick: FeedQuery["pick"];
}
export type PickRotation = "none" | WidgetGrammar["pick"]["rotations"][number];

export interface ViewChoice {
  block: WidgetBlock;
  fits: boolean;
  suggested: boolean;
}

export interface RuleList {
  mode: RuleMode;
  list: readonly WidgetRule[];
}

export type RuleTarget = { kind: "new" } | { kind: "edit"; index: number };

export interface RuleDraft {
  target: RuleTarget;
  rule: WidgetRule;
}

export interface WorkshopContext {
  catalog: WidgetCatalog;
  grammar: WidgetGrammar;
  presets: readonly WidgetPreset[];
  country: string;
  people: readonly HouseholdMember[];
}

export type WorkshopPurpose = "widget" | "rule";
export type SmartRefresh = NonNullable<WidgetDraft["playlist"]>["refresh"];

export interface WorkshopOpening {
  draft: WidgetDraft;
  widgetId: string | null;
  purpose: WorkshopPurpose;
  customizing?: string;
}

export interface PlaylistSectionProps {
  workshop: WidgetWorkshopState;
}

export interface PlaylistChoiceProps {
  workshop: WidgetWorkshopState;
}

export interface RefreshPickerProps {
  value: SmartRefresh;
  onChange: (refresh: SmartRefresh) => void;
}

export interface WorkshopSave {
  save: () => void;
  pending: boolean;
  ready: boolean;
}

export interface WidgetWorkshopState {
  draft: WidgetDraft;
  widgetId: string | null;
  purpose: WorkshopPurpose;
  kind: WidgetKind;
  dirty: boolean;
  playlistable: boolean;
  setPlaylist: (refresh: SmartRefresh | null) => void;
  linkPlaylist: (playlistId: string) => void;
  fitting: readonly WidgetBlock[];
  accepted: readonly WidgetBlock[];
  ruleDraft: RuleDraft | null;
  previewDraft: WidgetDraft;
  setKind: (kind: WidgetKind) => void;
  updateRecipe: (change: (recipe: RecipeQuery) => RecipeQuery) => void;
  setRecapPeriod: (period: RecapPeriod) => void;
  setRecipeSubject: (subject: WorkshopSubject) => void;
  setQuery: (query: WidgetQuery) => void;
  applyPreset: (preset: WidgetPreset) => void;
  setBlock: (block: WidgetBlock) => void;
  setAction: (action: WidgetAction) => void;
  setAccent: (accent: WidgetAccent) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setIcon: (icon: WidgetIcon) => void;
  setSize: (size: BoardSize) => void;
  openRule: (target: RuleTarget, rule: WidgetRule) => void;
  changeRule: (rule: WidgetRule) => void;
  commitRule: () => void;
  closeRule: () => void;
  removeRule: (index: number) => void;
  clearRules: () => void;
  setRuleMode: (mode: RuleMode) => void;
}

export interface WidgetWorkshopProps {
  opening: WorkshopOpening;
  context: WorkshopContext;
  onLeave: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSaved: (name: string) => void;
}

export interface WorkshopSectionProps {
  workshop: WidgetWorkshopState;
  context: WorkshopContext;
}

export interface StepRowProps {
  label: string;
  children: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
}

export interface WorkshopPreviewProps {
  draft: WidgetDraft;
  result: WidgetResult | undefined;
  isLoading: boolean;
  isError: boolean;
  onSizeChange: (size: BoardSize) => void;
}

export interface RuleEditorProps {
  draft: RuleDraft;
  fields: readonly RuleField[];
  limits: RuleLimits;
  people: readonly HouseholdMember[];
  onChange: (rule: WidgetRule) => void;
  onCancel: () => void;
  onCommit: () => void;
}

export interface RuleLimits {
  daysMax: number;
  topNMax: number;
}

export interface RuleControlsProps {
  rule: WidgetRule;
  limits: RuleLimits;
  people: readonly HouseholdMember[];
  onChange: (rule: WidgetRule) => void;
}

export interface WhereStepProps {
  workshop: WidgetWorkshopState;
  rules: RuleList;
  fields: readonly RuleField[];
  limits: RuleLimits;
  people: readonly HouseholdMember[];
}

export interface RecipeStepsProps {
  workshop: WidgetWorkshopState;
  recipe: RecipeQuery;
  grammar: WidgetGrammar;
  people: readonly HouseholdMember[];
}

export interface RecapStepsProps {
  workshop: WidgetWorkshopState;
  recap: RecapQuery;
  context: WorkshopContext;
}

export interface SubjectSelectProps {
  workshop: WidgetWorkshopState;
  value: WorkshopSubject;
  grammar: WidgetGrammar;
}

export interface FeedStepsProps {
  workshop: WidgetWorkshopState;
  feed: FeedQuery;
  context: WorkshopContext;
}

export interface WhenControlsProps {
  time: RecipeTime;
  modes: readonly TimeMode[];
  periods: readonly NamedPeriod[];
  limits: { daysMax: number; yearMin: number; yearMax: number };
  onChange: (time: RecipeTime) => void;
}

export interface IconPickerProps {
  icons: readonly WidgetIcon[];
  value: WidgetIcon;
  onChange: (icon: WidgetIcon) => void;
}

export interface NewsUrlFieldProps {
  url: string;
  onCommit: (url: string) => void;
}

export interface NumberFieldProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
}
