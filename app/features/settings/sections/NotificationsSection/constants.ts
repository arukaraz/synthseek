import type { ChannelField, NotificationChannel } from "./types";

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

export const CHANNEL_TABS_LAYOUT_ID = "notification-channel-tab";
