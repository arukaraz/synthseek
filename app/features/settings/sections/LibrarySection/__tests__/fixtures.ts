import type { LibraryPathSummary, LibraryRule, OrganiseStatus } from "../types";

export const DEFAULT_TEMPLATE = "{albumartist}/{album}/<Disc {disc:02d}>/{track:02d} - {title}.{ext}";

export function makePath(overrides: Partial<LibraryPathSummary> = {}): LibraryPathSummary {
  return {
    id: "primary",
    label: "Music",
    folder: "/music",
    fromEnvironment: true,
    enabled: true,
    isDefault: true,
    namingTemplate: DEFAULT_TEMPLATE,
    access: "writable",
    files: 7415,
    sizeBytes: 250 * 1024 ** 3,
    freeBytes: 750 * 1024 ** 3,
    ruleIds: [],
    lastScanAt: null,
    lastScanOutcome: null,
    ...overrides,
  };
}

export function makeArchive(overrides: Partial<LibraryPathSummary> = {}): LibraryPathSummary {
  return makePath({
    id: "archive",
    label: "Archive",
    folder: "/mnt/archive",
    fromEnvironment: false,
    isDefault: false,
    files: 0,
    sizeBytes: 0,
    ruleIds: ["rule-ana", "rule-ost"],
    ...overrides,
  });
}

export function makeRule(overrides: Partial<LibraryRule> = {}): LibraryRule {
  return {
    id: "rule-ana",
    name: "Ana's music",
    matchMode: "all",
    conditions: [{ field: "requested_by", op: "is", value: "user-ana" }],
    position: 0,
    libraryPathId: null,
    ...overrides,
  };
}

export function makeOrganiseStatus(overrides: Partial<OrganiseStatus> = {}): OrganiseStatus {
  return {
    running: false,
    pathId: null,
    cancelling: false,
    total: 0,
    processed: 0,
    moved: 0,
    failed: 0,
    companionsMoved: 0,
    companionsFailed: 0,
    startedAt: null,
    finishedAt: null,
    failures: [],
    ...overrides,
  };
}

export const MEMBERS = [
  { id: "user-ana", username: "Ana" },
  { id: "user-leo", username: "Leo" },
];
