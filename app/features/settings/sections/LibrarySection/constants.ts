import type { ParseKeys } from "i18next";

import type {
  LibraryScanOutcome,
  ConditionValueKind,
  FieldOps,
  FolderAccess,
  MoveClass,
  PathTone,
  RuleField,
  RuleQuality,
  RuleRequestType,
} from "./types";

export const MOVE_CLASSES: readonly MoveClass[] = ["relocate", "rename", "reassign"];

export const SKIPPED_SCAN_KEYS: Readonly<Record<Exclude<LibraryScanOutcome, "reconciled">, ParseKeys<"settings">>> = {
  unavailable: "libraryScan.paths.outcome.unavailable",
  disabled: "libraryScan.paths.outcome.disabled",
  unreadable: "libraryScan.paths.outcome.unreadable",
  empty: "libraryScan.paths.outcome.empty",
};

export const PREVIEW_DEBOUNCE_MS = 600;

export const PREVIEW_PAGE_SIZE = 25;

export const PAGE_SIZES = [25, 50, 100] as const;

export const MIN_SAMPLE_FOR_ESTIMATE = 25;

export const EXTENSION_SUFFIX = ".{ext}";

export const EXTENSION_TOKEN = "{ext}";

export const SAMPLE_LABELS = {
  single_disc: "libraryNaming.samples.single_disc",
  multi_disc: "libraryNaming.samples.multi_disc",
  compilation: "libraryNaming.samples.compilation",
} as const;

export const FOLDER_DEBOUNCE_MS = 500;

export const PATH_LABEL_MAX_LENGTH = 64;

export const RULE_NAME_MAX_LENGTH = 64;

export const RULE_VALUE_MAX_LENGTH = 128;

export const MAX_RULE_CONDITIONS = 12;

export const YEAR_RANGE = { min: 1000, max: 9999 } as const;

export const TRACK_COUNT_RANGE = { min: 0, max: 1000 } as const;

export const ACCESS_TONE: Readonly<Record<FolderAccess, PathTone>> = {
  writable: "success",
  readonly: "warning",
  missing: "danger",
  not_directory: "danger",
  unreachable: "danger",
};

export const RULE_FIELDS: readonly RuleField[] = [
  "requested_by",
  "genre",
  "artist",
  "quality",
  "year",
  "request_type",
  "track_count",
];

export const FIELD_OPS: FieldOps = {
  requested_by: ["is", "is_not"],
  genre: ["contains", "not_contains"],
  artist: ["is", "contains", "is_not"],
  quality: ["is"],
  year: ["before", "after", "is"],
  request_type: ["is", "is_not"],
  track_count: ["more_than", "fewer_than"],
};

export const FIELD_KIND: Readonly<Record<RuleField, ConditionValueKind>> = {
  requested_by: "member",
  genre: "text",
  artist: "text",
  quality: "quality",
  year: "number",
  request_type: "requestType",
  track_count: "number",
};

export const RULE_QUALITIES: readonly RuleQuality[] = ["lossless", "lossy"];

export const RULE_REQUEST_TYPES: readonly RuleRequestType[] = ["album", "track", "playlist", "artist"];
