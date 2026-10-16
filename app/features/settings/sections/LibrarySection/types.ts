import type { inferRouterOutputs } from "@trpc/server";
import type { TFunction } from "i18next";

import type { AppRouter } from "@api/__generated__/types";

type LibraryOutputs = inferRouterOutputs<AppRouter>["library"];

export type OrganisePreview = LibraryOutputs["organise"]["preview"];
export type NamingCurrent = LibraryOutputs["naming"]["current"];
export type NamingToken = NamingCurrent["tokens"][number];
export type OrganiseStatus = LibraryOutputs["organise"]["status"];
export type MoveClass = OrganisePreview["movesByClass"][number]["moveClass"];
export type NamingPreview = LibraryOutputs["naming"]["preview"];

export type LibraryPathSummary = LibraryOutputs["paths"]["list"][number];
export type FolderAccess = LibraryPathSummary["access"];
export type FolderVerdict = LibraryOutputs["paths"]["judgeFolder"];
export type FolderRefusal = Extract<FolderVerdict, { outcome: "refused" }>;
export type FolderCheck = NonNullable<LibraryOutputs["paths"]["checkFolder"]>;
export type PathWriteResult = LibraryOutputs["paths"]["update"];
export type PathWriteRefusal = Exclude<PathWriteResult, { outcome: "saved" }>;
export type RemoveBlocker = Extract<LibraryOutputs["paths"]["remove"], { outcome: "blocked" }>["blockers"][number];

export type LibraryRule = LibraryOutputs["rules"]["list"][number];
export type RuleMatchMode = LibraryRule["matchMode"];
export type RuleCondition = LibraryRule["conditions"][number];
export type RuleField = RuleCondition["field"];
export type RuleOp = RuleCondition["op"];
export type RuleQuality = Extract<RuleCondition, { field: "quality" }>["value"];
export type RuleRequestType = Extract<RuleCondition, { field: "request_type" }>["value"];
export type RuleWriteResult = LibraryOutputs["rules"]["update"];
export type RuleWriteRefusal = Exclude<RuleWriteResult, { outcome: "saved" }>;

export type FieldOps = { readonly [F in RuleField]: readonly Extract<RuleCondition, { field: F }>["op"][] };

export type ConditionValueKind = "member" | "text" | "number" | "quality" | "requestType";

export interface ConditionDraft {
  key: string;
  field: RuleField;
  op: RuleOp;
  value: string;
}

export type PathTone = "success" | "warning" | "danger" | "muted";

export interface RuleMember {
  id: string;
  username: string;
}

export interface FieldMessage {
  tone: "neutral" | "success" | "danger";
  text: string;
}

export interface FolderMessageInput {
  fromEnvironment: boolean;
  refusal: FolderRefusal | null;
  judging: boolean;
  verdict: FolderVerdict | undefined;
}

export interface TemplateHintInput {
  path: LibraryPathSummary | null;
  settled: boolean;
  invalid: boolean;
  moves: number;
}

export interface DefaultHintInput {
  readonly: boolean;
  isDefault: boolean;
  currentDefaultLabel: string | null;
}

export type PathModalTarget = { mode: "add" } | { mode: "edit"; pathId: string };

export type RuleModalTarget = { mode: "add" } | { mode: "edit"; ruleId: string };

export interface RunOutcome {
  moved: number;
  companionsMoved: number;
  failed: number;
  companionsFailed: number;
  abandoned: number;
  failures: OrganiseStatus["failures"];
  listedFailures: number;
  duration: string;
}

export type MoveFilter = "all" | MoveClass;

export type TemplateProblem = Extract<NamingPreview, { outcome: "invalid" }>["problem"];

export interface TokensModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: string;
  edited: string;
  tokens: readonly NamingToken[];
  problem: TemplateProblem | null;
  onTemplateChange: (next: string) => void;
}

export interface MoveProgress {
  percent: number;
  processed: number;
  total: number;
  remaining: string | null;
}

export interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathId: string;
  pathLabel: string;
  template: string;
}

export interface OrganiseProgressProps {
  status: OrganiseStatus;
}

export interface LibraryPathRowProps {
  path: LibraryPathSummary;
  organise: OrganiseStatus | undefined;
  onEdit: () => void;
}

export interface LibraryPathModalProps {
  target: PathModalTarget;
  paths: readonly LibraryPathSummary[];
  rules: readonly LibraryRule[];
  members: readonly RuleMember[];
  organise: OrganiseStatus | undefined;
  onClose: () => void;
}

export interface FolderFieldProps {
  path: LibraryPathSummary | null;
  folder: string;
  onFolderChange: (next: string) => void;
  verdict: FolderVerdict | undefined;
  judging: boolean;
  refusal: PathWriteRefusal | null;
}

export interface FolderCheckNoticeProps {
  path: LibraryPathSummary;
  check: FolderCheck | null | undefined;
  checking: boolean;
  canCheck: boolean;
  onCheck: () => void;
  refusal: PathWriteRefusal | null;
}

export interface DefaultPathToggleProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  path: LibraryPathSummary | null;
  readonly: boolean;
  currentDefaultLabel: string | null;
  refused: boolean;
}

export interface PathRulesPickerProps {
  pathId: string | null;
  rules: readonly LibraryRule[];
  paths: readonly LibraryPathSummary[];
  members: readonly RuleMember[];
  selected: readonly string[];
  onToggle: (ruleId: string, checked: boolean) => void;
  refusal: PathWriteRefusal | null;
}

export interface NamingFieldProps {
  path: LibraryPathSummary | null;
  edited: string;
  onEditedChange: (next: string) => void;
  tokens: readonly NamingToken[];
  preview: NamingPreview | undefined;
  settled: boolean;
  organise: OrganiseStatus | undefined;
  refused: boolean;
}

export interface RemovePathActionProps {
  path: LibraryPathSummary;
  songCount?: number | null;
  onRemoved: () => void;
  onBlocked: (blockers: readonly RemoveBlocker[]) => void;
}

export interface LibraryRuleRowProps {
  rule: LibraryRule;
  index: number;
  count: number;
  pathLabel: string | null;
  members: readonly RuleMember[];
  reordering: boolean;
  onMove: (offset: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface LibraryRuleModalProps {
  rule: LibraryRule | null;
  members: readonly RuleMember[];
  onClose: () => void;
}

export interface ConditionRowProps {
  draft: ConditionDraft;
  position: number;
  members: readonly RuleMember[];
  removable: boolean;
  onChange: (next: ConditionDraft) => void;
  onRemove: () => void;
}

export type LibraryScanPath = LibraryOutputs["scan"]["status"]["paths"][number];

export type LibraryScanOutcome = NonNullable<LibraryScanPath["lastScanOutcome"]>;

export interface ScanPathColumnsArgs {
  t: TFunction<"settings">;
  busy: boolean;
  onScan: (path: LibraryScanPath) => void;
}

export interface LastScanText {
  text: string;
  skipped: boolean;
}
