import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
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

export interface ChannelPanelProps {
  channel: NotificationChannel;
  destination: NotificationDestination | undefined;
  catalog: NotificationCatalog;
}

export interface KindChecklistProps {
  categories: NotificationCategory[];
  selected: NotificationKind[];
  disabled: boolean;
  onChange: (kinds: NotificationKind[]) => void;
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
