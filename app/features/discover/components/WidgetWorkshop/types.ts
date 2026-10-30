import type { ReactNode } from "react";

import type { BoardSize } from "@hooks/api/queries/board/types";
import type {
  FeedQuery,
  QuestionQuery,
  WidgetAccent,
  WidgetAction,
  WidgetBlock,
  WidgetCatalog,
  WidgetDocument,
  WidgetDraft,
  WidgetGrammar,
  WidgetIcon,
  WidgetPreset,
  WidgetQuery,
  WidgetResult,
} from "@hooks/api/queries/widgets/types";

export type WidgetKind = WidgetQuery["type"];
export type QuestionTime = QuestionQuery["time"];
export type QuestionSubject = QuestionQuery["subject"];
export type QuestionMeasure = QuestionQuery["measure"];
export type QuestionGroupBy = NonNullable<QuestionQuery["groupBy"]>;
export type WidgetRules = NonNullable<QuestionQuery["rules"]>;
export type WidgetRule = NonNullable<WidgetRules["all"]>[number];
export type RuleField = WidgetRule["field"];
export type RuleMode = "all" | "any";
export type GrammarSubject = WidgetGrammar["subjects"][number];
export type TimeMode = QuestionTime["mode"];
export type NamedPeriod = Extract<QuestionTime, { mode: "named" }>["value"];
export type FeedSource = FeedQuery["source"];
export type FeedSeed = Extract<FeedQuery, { source: "lastfm.similarArtists" }>["params"]["seed"];
export type FeedSeedKind = "myTopArtists" | "favorites";
export type ListenBrainzPlaylist = Extract<FeedQuery, { source: "listenbrainz.playlists" }>["params"]["playlist"];
export type FeedPickBy = FeedQuery["pick"]["by"];
export type CatalogFeedSource = WidgetCatalog["feeds"]["sources"][number];

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
}

export interface WorkshopOpening {
  draft: WidgetDraft;
  widgetId: string | null;
}

export interface WidgetWorkshopState {
  draft: WidgetDraft;
  widgetId: string | null;
  kind: WidgetKind;
  dirty: boolean;
  fitting: readonly WidgetBlock[];
  accepted: readonly WidgetBlock[];
  ruleDraft: RuleDraft | null;
  previewDraft: WidgetDraft;
  setKind: (kind: WidgetKind) => void;
  updateQuestion: (change: (question: QuestionQuery) => QuestionQuery) => void;
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
  onSaved: (saved: WidgetDocument) => void;
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
}

export interface RuleEditorProps {
  draft: RuleDraft;
  fields: readonly RuleField[];
  limits: RuleLimits;
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
  onChange: (rule: WidgetRule) => void;
}

export interface WhereStepProps {
  workshop: WidgetWorkshopState;
  rules: RuleList;
  fields: readonly RuleField[];
  limits: RuleLimits;
}

export interface RecipeStepsProps {
  workshop: WidgetWorkshopState;
  question: QuestionQuery;
  grammar: WidgetGrammar;
}

export interface FeedStepsProps {
  workshop: WidgetWorkshopState;
  feed: FeedQuery;
  context: WorkshopContext;
}

export interface WhenControlsProps {
  time: QuestionTime;
  modes: readonly TimeMode[];
  periods: readonly NamedPeriod[];
  limits: { daysMax: number; yearMin: number; yearMax: number };
  onChange: (time: QuestionTime) => void;
}

export interface IconPickerProps {
  icons: readonly WidgetIcon[];
  value: WidgetIcon;
  onChange: (icon: WidgetIcon) => void;
}

export interface NumberFieldProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
}
