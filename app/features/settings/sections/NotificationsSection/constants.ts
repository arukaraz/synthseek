import { Megaphone, Send, Webhook } from "lucide-react";

import type { ChannelField, ChannelGlyph, NotificationChannel, NotificationKind, NotificationPresetId } from "./types";

export const CHANNEL_FIELDS: Readonly<Record<NotificationChannel, readonly ChannelField[]>> = {
  discord: [{ name: "webhookUrl", secret: true, required: true }],
  ntfy: [
    { name: "serverUrl", secret: false, required: true },
    { name: "topic", secret: false, required: true },
    { name: "accessToken", secret: true, required: false },
  ],
  telegram: [
    { name: "botToken", secret: true, required: true },
    { name: "chatId", secret: false, required: true },
  ],
  webhook: [
    { name: "url", secret: true, required: true },
    { name: "authorization", secret: true, required: false },
  ],
  apprise: [
    { name: "url", secret: true, required: true },
    { name: "targets", secret: true, required: false },
  ],
};

export const PUBLIC_NTFY_SERVER = "https://ntfy.sh";

export const CHANNEL_GLYPHS: Readonly<Record<NotificationChannel, ChannelGlyph>> = {
  discord: {
    kind: "path",
    d: "M7.5 5.5C9 5 10.4 4.8 12 4.8s3 .2 4.5.7c1.9 2.6 2.9 5.4 3 8.6-1.4 1.1-2.9 1.9-4.6 2.4l-1-1.6c.6-.2 1.2-.5 1.7-.9-3.1 1.4-6.1 1.4-9.2 0 .5.4 1.1.7 1.7.9l-1 1.6c-1.7-.5-3.2-1.3-4.6-2.4.1-3.2 1.1-6 3-8.6zM9.2 13.2c.8 0 1.4-.7 1.4-1.6S10 10 9.2 10s-1.4.7-1.4 1.6.6 1.6 1.4 1.6zm5.6 0c.8 0 1.4-.7 1.4-1.6s-.6-1.6-1.4-1.6-1.4.7-1.4 1.6.6 1.6 1.4 1.6z",
  },
  ntfy: {
    kind: "path",
    d: "M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 5 3 2.5L7 14h2.2l3-2.5-3-2.5H7zm6 4v1.5h4V13h-4z",
  },
  telegram: { kind: "icon", icon: Send },
  webhook: { kind: "icon", icon: Webhook },
  apprise: { kind: "icon", icon: Megaphone },
};

export const NOTIFICATION_PRESETS: Readonly<Record<NotificationPresetId, readonly NotificationKind[] | "all">> = {
  failures: [
    "track_failed",
    "album_failed",
    "playlist_failed",
    "connection_attention",
    "quota_reached",
    "member_quota_reached",
    "system_status",
    "integration_health",
    "low_disk_space",
    "job_failed",
    "purge_upcoming",
  ],
  finished: ["album_completed", "album_partial", "playlist_completed", "playlist_partial", "import_finished"],
  everything: "all",
};

export const NOTIFICATION_PRESET_IDS: readonly NotificationPresetId[] = ["failures", "finished", "everything"];
