import type { TFunction } from "i18next";

import i18n from "@locale";
import { formatDuration, formatRelativeTime } from "@utils/formatters";

import {
  SKIPPED_SCAN_KEYS,
  ACCESS_TONE,
  EXTENSION_SUFFIX,
  EXTENSION_TOKEN,
  FIELD_KIND,
  FIELD_OPS,
  MIN_SAMPLE_FOR_ESTIMATE,
  MOVE_CLASSES,
  RULE_QUALITIES,
  RULE_REQUEST_TYPES,
  RULE_VALUE_MAX_LENGTH,
  SAMPLE_LABELS,
  TRACK_COUNT_RANGE,
  YEAR_RANGE,
} from "./constants";

import type {
  ConditionDraft,
  DefaultHintInput,
  FieldMessage,
  FolderMessageInput,
  FolderRefusal,
  LibraryPathSummary,
  LibraryRule,
  MoveClass,
  MoveFilter,
  OrganiseStatus,
  PathTone,
  RemoveBlocker,
  RuleCondition,
  RuleField,
  RuleMember,
  RunOutcome,
  TemplateHintInput,
  LastScanText,
  LibraryScanPath,
} from "./types";

export function lastScanOf(path: LibraryScanPath, t: TFunction<"settings">): LastScanText {
  if (path.scanning) return { text: t("libraryScan.header.running"), skipped: false };
  if (path.lastScanAt === null) return { text: t("libraryScan.paths.never"), skipped: false };
  if (path.lastScanOutcome === null || path.lastScanOutcome === "reconciled") {
    return { text: formatRelativeTime(new Date(path.lastScanAt)), skipped: false };
  }
  return { text: t(SKIPPED_SCAN_KEYS[path.lastScanOutcome]), skipped: true };
}

export function sampleLabelKey(id: string): (typeof SAMPLE_LABELS)[keyof typeof SAMPLE_LABELS] | null {
  for (const [key, value] of Object.entries(SAMPLE_LABELS)) {
    if (key === id) return value;
  }
  return null;
}

export function classesFor(filter: MoveFilter): MoveClass[] {
  return filter === "all" ? [...MOVE_CLASSES] : [filter];
}

export function countFrom(
  byClass: readonly { moveClass: MoveClass; count: number }[] | undefined,
  moveClass: MoveClass
): number {
  return byClass?.find((entry) => entry.moveClass === moveClass)?.count ?? 0;
}

export function percentDone(processed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((processed / total) * 100));
}

export function withoutExtension(template: string): string {
  return template.endsWith(EXTENSION_SUFFIX) ? template.slice(0, -EXTENSION_SUFFIX.length) : template;
}

function withoutTrailingFiller(value: string): string {
  let end = value.length;
  while (end > 0 && (value[end - 1] === "." || value[end - 1] === " ")) end -= 1;
  return value.slice(0, end);
}

export function withExtension(edited: string): string {
  return `${withoutTrailingFiller(withoutExtension(edited.trimEnd()))}${EXTENSION_SUFFIX}`;
}

export function refuseExtensionTyping(typed: string): string {
  return typed.split(EXTENSION_TOKEN).join("");
}

export function insertAtCursor(value: string, token: string, start: number, end: number): string {
  return value.slice(0, start) + token + value.slice(end);
}

export function secondsRemaining(status: OrganiseStatus | undefined, now: number): number | null {
  if (status === undefined || !status.running || status.startedAt === null) return null;
  if (status.processed < MIN_SAMPLE_FOR_ESTIMATE || status.processed >= status.total) return null;
  const elapsed = (now - new Date(status.startedAt).getTime()) / 1000;
  if (elapsed <= 0) return null;
  return Math.round((elapsed / status.processed) * (status.total - status.processed));
}

export function runOutcome(status: OrganiseStatus | undefined): RunOutcome | null {
  if (status === undefined || status.running) return null;
  if (status.startedAt === null || status.finishedAt === null) return null;

  return {
    moved: status.moved,
    companionsMoved: status.companionsMoved,
    failed: status.failed,
    companionsFailed: status.companionsFailed,
    abandoned: Math.max(0, status.total - status.processed),
    failures: status.failures,
    listedFailures: status.failures.length,
    duration: formatDuration(new Date(status.startedAt), new Date(status.finishedAt)) ?? "",
  };
}

export function comparableFolder(folder: string): string {
  let value = folder.trim();
  while (value.length > 1 && value.endsWith("/")) value = value.slice(0, -1);
  return value;
}

export function pathTone(path: LibraryPathSummary): PathTone {
  return path.enabled ? ACCESS_TONE[path.access] : "muted";
}

export function pathStatusLabel(path: LibraryPathSummary): string {
  return path.enabled
    ? i18n.t(`settings:libraryPaths.status.${path.access}`)
    : i18n.t("settings:libraryPaths.status.disabled");
}

function folderProblemText(refusal: FolderRefusal): string {
  switch (refusal.problem) {
    case "not_absolute":
      return i18n.t("settings:libraryPaths.folder.problem.not_absolute");
    case "too_long":
      return i18n.t("settings:libraryPaths.folder.problem.too_long");
    case "system_folder":
      return i18n.t("settings:libraryPaths.folder.problem.system_folder");
    case "same_as_path":
      return i18n.t("settings:libraryPaths.folder.problem.same_as_path", { label: refusal.label });
    case "inside_path":
      return i18n.t("settings:libraryPaths.folder.problem.inside_path", { label: refusal.label });
    case "contains_path":
      return i18n.t("settings:libraryPaths.folder.problem.contains_path", { label: refusal.label });
    case "app_folder":
      return i18n.t("settings:libraryPaths.folder.problem.app_folder", { folder: refusal.folder });
    case "not_found":
      return i18n.t("settings:libraryPaths.folder.problem.not_found", { folder: refusal.folder });
    case "not_directory":
      return i18n.t("settings:libraryPaths.folder.problem.not_directory");
    case "unreachable":
      return i18n.t("settings:libraryPaths.folder.problem.unreachable");
  }
}

export function folderMessage({ fromEnvironment, refusal, judging, verdict }: FolderMessageInput): FieldMessage | null {
  if (fromEnvironment) return { tone: "neutral", text: i18n.t("settings:libraryPaths.folder.fromEnvironment") };
  if (refusal !== null) return { tone: "danger", text: folderProblemText(refusal) };
  if (judging) return { tone: "neutral", text: i18n.t("settings:libraryPaths.folder.checking") };
  if (verdict?.outcome !== "usable") return null;
  if (verdict.access === "readonly") return { tone: "neutral", text: i18n.t("settings:libraryPaths.folder.readonly") };
  return { tone: "success", text: i18n.t("settings:libraryPaths.folder.usable") };
}

export function songsOnlyBlocker(blockers: readonly RemoveBlocker[]): number | null {
  const [only] = blockers;
  if (blockers.length !== 1 || only === undefined || only.reason !== "has_songs") return null;
  return only.count;
}

export function blockerText(blocker: RemoveBlocker): string {
  switch (blocker.reason) {
    case "from_environment":
      return i18n.t("settings:libraryPaths.remove.blocker.from_environment");
    case "default_path":
      return i18n.t("settings:libraryPaths.remove.blocker.default_path");
    case "has_rules":
      return i18n.t("settings:libraryPaths.remove.blocker.has_rules", { count: blocker.count });
    case "has_songs":
      return i18n.t("settings:libraryPaths.remove.blocker.has_songs", {
        count: blocker.count,
        formatted: blocker.count.toLocaleString(),
      });
    case "pending_downloads":
      return i18n.t("settings:libraryPaths.remove.blocker.pending_downloads", { count: blocker.count });
  }
}

export function defaultPathHint({ readonly, isDefault, currentDefaultLabel }: DefaultHintInput): string {
  if (readonly) return i18n.t("settings:libraryPaths.default.readonly");
  if (isDefault || currentDefaultLabel === null) return i18n.t("settings:libraryPaths.default.isThis");
  return i18n.t("settings:libraryPaths.default.other", { label: currentDefaultLabel });
}

export function templateHint({ path, settled, invalid, moves }: TemplateHintInput): string | null {
  if (path === null) return i18n.t("settings:libraryPaths.naming.addHint");
  if (path.access === "readonly") return i18n.t("settings:libraryPaths.naming.readonly");
  if (!settled) return i18n.t("settings:libraryNaming.preview.loading");
  if (invalid) return null;
  if (moves === 0) return i18n.t("settings:libraryPaths.naming.inPlace");
  return i18n.t("settings:libraryPaths.naming.moves", {
    count: moves,
    formatted: moves.toLocaleString(),
    label: path.label,
  });
}

function pickOption<T extends string>(options: readonly T[], value: string): T | null {
  return options.find((option) => option === value) ?? null;
}

function wholeNumberIn(value: string, range: { min: number; max: number }): number | null {
  if (value.length === 0) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= range.min && parsed <= range.max ? parsed : null;
}

function ruleText(value: string): string | null {
  return value.length > 0 && value.length <= RULE_VALUE_MAX_LENGTH ? value : null;
}

export function conditionFromDraft(draft: ConditionDraft): RuleCondition | null {
  const value = draft.value.trim();
  switch (draft.field) {
    case "requested_by": {
      const op = pickOption(FIELD_OPS.requested_by, draft.op);
      return op !== null && value.length > 0 ? { field: "requested_by", op, value } : null;
    }
    case "genre": {
      const op = pickOption(FIELD_OPS.genre, draft.op);
      const text = ruleText(value);
      return op !== null && text !== null ? { field: "genre", op, value: text } : null;
    }
    case "artist": {
      const op = pickOption(FIELD_OPS.artist, draft.op);
      const text = ruleText(value);
      return op !== null && text !== null ? { field: "artist", op, value: text } : null;
    }
    case "quality": {
      const op = pickOption(FIELD_OPS.quality, draft.op);
      const quality = pickOption(RULE_QUALITIES, value);
      return op !== null && quality !== null ? { field: "quality", op, value: quality } : null;
    }
    case "year": {
      const op = pickOption(FIELD_OPS.year, draft.op);
      const year = wholeNumberIn(value, YEAR_RANGE);
      return op !== null && year !== null ? { field: "year", op, value: year } : null;
    }
    case "request_type": {
      const op = pickOption(FIELD_OPS.request_type, draft.op);
      const type = pickOption(RULE_REQUEST_TYPES, value);
      return op !== null && type !== null ? { field: "request_type", op, value: type } : null;
    }
    case "track_count": {
      const op = pickOption(FIELD_OPS.track_count, draft.op);
      const count = wholeNumberIn(value, TRACK_COUNT_RANGE);
      return op !== null && count !== null ? { field: "track_count", op, value: count } : null;
    }
  }
}

export function draftFromCondition(condition: RuleCondition, key: string): ConditionDraft {
  return { key, field: condition.field, op: condition.op, value: String(condition.value) };
}

export function draftForField(field: RuleField, key: string, firstMemberId: string | null): ConditionDraft {
  const op = FIELD_OPS[field][0];
  switch (FIELD_KIND[field]) {
    case "member":
      return { key, field, op, value: firstMemberId ?? "" };
    case "quality":
      return { key, field, op, value: "lossless" };
    case "requestType":
      return { key, field, op, value: "album" };
    case "text":
    case "number":
      return { key, field, op, value: "" };
  }
}

export function conditionPlaceholder(field: RuleField): string | undefined {
  switch (field) {
    case "genre":
    case "artist":
    case "year":
    case "track_count":
      return i18n.t(`settings:libraryRules.modal.placeholders.${field}`);
    case "requested_by":
    case "quality":
    case "request_type":
      return undefined;
  }
}

function conditionValueLabel(condition: RuleCondition, members: readonly RuleMember[]): string {
  switch (condition.field) {
    case "requested_by":
      return (
        members.find((member) => member.id === condition.value)?.username ??
        i18n.t("settings:libraryRules.unknownMember")
      );
    case "quality":
      return i18n.t(`settings:libraryRules.quality.${condition.value}`);
    case "request_type":
      return i18n.t(`settings:libraryRules.requestType.${condition.value}`);
    case "genre":
    case "artist":
      return condition.value;
    case "year":
    case "track_count":
      return String(condition.value);
  }
}

function conditionSummary(condition: RuleCondition, members: readonly RuleMember[]): string {
  return i18n.t("settings:libraryRules.summary.condition", {
    field: i18n.t(`settings:libraryRules.fields.${condition.field}`),
    op: i18n.t(`settings:libraryRules.ops.${condition.op}`),
    value: conditionValueLabel(condition, members),
  });
}

export function ruleSummary(
  rule: Pick<LibraryRule, "matchMode" | "conditions">,
  members: readonly RuleMember[]
): string {
  const [first, ...rest] = rule.conditions.map((condition) => conditionSummary(condition, members));
  if (first === undefined) return i18n.t("settings:libraryRules.summary.none");
  const joiner = rule.matchMode === "all" ? "settings:libraryRules.summary.and" : "settings:libraryRules.summary.or";
  return rest.reduce((left, right) => i18n.t(joiner, { left, right }), first);
}

export function movedIds(ids: readonly string[], index: number, offset: -1 | 1): string[] {
  const target = index + offset;
  if (target < 0 || target >= ids.length) return [...ids];
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
