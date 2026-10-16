import { CHANNEL_FIELDS, NOTIFICATION_PRESETS, PUBLIC_NTFY_SERVER } from "./constants";
import type {
  CategorySelection,
  DestinationDraft,
  NotificationCategory,
  NotificationChannel,
  NotificationDestination,
  NotificationKind,
  NotificationPresetId,
  SaveDestinationInput,
} from "./types";

export function availableKinds(categories: readonly NotificationCategory[]): NotificationKind[] {
  return categories.flatMap((category) => category.kinds);
}

export function presetKinds(preset: NotificationPresetId, available: readonly NotificationKind[]): NotificationKind[] {
  const kinds = NOTIFICATION_PRESETS[preset];
  return kinds === "all" ? [...available] : available.filter((kind) => kinds.includes(kind));
}

export function countSelected(kinds: readonly NotificationKind[], selected: readonly NotificationKind[]): number {
  return kinds.filter((kind) => selected.includes(kind)).length;
}

export function draftOf(
  channel: NotificationChannel,
  destination: NotificationDestination | undefined
): DestinationDraft {
  const config = Object.fromEntries(
    CHANNEL_FIELDS[channel].map((field) => [field.name, destination?.config[field.name] ?? ""])
  );
  if (channel === "ntfy" && config.serverUrl === "") config.serverUrl = PUBLIC_NTFY_SERVER;
  return {
    enabled: destination?.configured ? destination.enabled : true,
    config,
    kinds: destination?.kinds ?? [],
    allRequests: destination?.allRequests ?? false,
  };
}

export function sameDraft(left: DestinationDraft, right: DestinationDraft): boolean {
  return (
    left.enabled === right.enabled &&
    left.allRequests === right.allRequests &&
    left.kinds.length === right.kinds.length &&
    left.kinds.every((kind) => right.kinds.includes(kind)) &&
    Object.entries(left.config).every(([name, value]) => right.config[name] === value)
  );
}

export function isDraftComplete(channel: NotificationChannel, draft: DestinationDraft): boolean {
  return CHANNEL_FIELDS[channel].every((field) => !field.required || (draft.config[field.name] ?? "").trim() !== "");
}

export function saveInputOf(channel: NotificationChannel, draft: DestinationDraft): SaveDestinationInput {
  return {
    channel,
    enabled: draft.enabled,
    config: Object.fromEntries(Object.entries(draft.config).map(([name, value]) => [name, value.trim()])),
    kinds: draft.kinds,
    allRequests: draft.allRequests,
  };
}

export function categorySelection(
  kinds: readonly NotificationKind[],
  selected: readonly NotificationKind[]
): CategorySelection {
  const chosen = kinds.filter((kind) => selected.includes(kind)).length;
  if (chosen === 0) return false;
  return chosen === kinds.length ? true : "indeterminate";
}

export function withCategory(
  kinds: readonly NotificationKind[],
  selected: readonly NotificationKind[],
  include: boolean
): NotificationKind[] {
  const rest = selected.filter((kind) => !kinds.includes(kind));
  return include ? [...rest, ...kinds] : rest;
}

export function withKind(
  selected: readonly NotificationKind[],
  kind: NotificationKind,
  include: boolean
): NotificationKind[] {
  const rest = selected.filter((entry) => entry !== kind);
  return include ? [...rest, kind] : rest;
}
