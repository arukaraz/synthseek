import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { LucideIcon } from "lucide-react";

import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type RouterInputs = inferRouterInputs<AppRouter>;

export type NotificationCatalog = RouterOutputs["notifications"]["catalog"];
export type NotificationCategory = NotificationCatalog["categories"][number];
export type NotificationCategoryId = NotificationCategory["id"];
export type NotificationKind = NotificationCategory["kinds"][number];
export type NotificationChannel = NotificationCatalog["channels"][number];
export type NotificationDestination = RouterOutputs["notifications"]["list"][number];
export type DeliveryFailure = NonNullable<NotificationDestination["lastFailure"]>;
export type SaveDestinationInput = RouterInputs["notifications"]["save"];
export type NotificationTestOutcome = RouterOutputs["notifications"]["test"];

export type ChannelFieldName =
  | "webhookUrl"
  | "serverUrl"
  | "topic"
  | "accessToken"
  | "botToken"
  | "chatId"
  | "url"
  | "authorization"
  | "targets";

export interface ChannelField {
  name: ChannelFieldName;
  secret: boolean;
  required: boolean;
}

export interface DestinationDraft {
  enabled: boolean;
  config: Record<string, string>;
  kinds: NotificationKind[];
  allRequests: boolean;
}

export type CategorySelection = boolean | "indeterminate";

export type ChannelGlyph = { kind: "path"; d: string } | { kind: "icon"; icon: LucideIcon };

export type NotificationPresetId = "failures" | "finished" | "everything";

export interface DestinationRowProps {
  channel: NotificationChannel;
  destination: NotificationDestination | undefined;
  catalog: NotificationCatalog;
  draft: DestinationDraft;
  baseline: DestinationDraft;
  open: boolean;
  onToggleOpen: () => void;
  onDraftChange: (draft: DestinationDraft) => void;
  onSettled: () => void;
}

export interface ChannelMarkProps {
  channel: NotificationChannel;
  size: "sm" | "md";
}

export interface NotificationMatrixProps {
  categories: NotificationCategory[];
  columns: readonly NotificationChannel[];
  kindsOf: (channel: NotificationChannel) => NotificationKind[];
  onKindsChange: (channel: NotificationChannel, kinds: NotificationKind[]) => void;
}

export interface MatrixPresetMenuProps {
  channel: NotificationChannel;
  selectedCount: number;
  others: readonly NotificationChannel[];
  available: readonly NotificationKind[];
  kindsOf: (channel: NotificationChannel) => NotificationKind[];
  onApply: (kinds: NotificationKind[]) => void;
}

export interface ChannelFieldsProps {
  channel: NotificationChannel;
  config: Record<string, string>;
  ntfyServers: string[] | null;
  onChange: (name: ChannelFieldName, value: string) => void;
}

export interface DestinationStatusProps {
  destination: NotificationDestination | undefined;
}
