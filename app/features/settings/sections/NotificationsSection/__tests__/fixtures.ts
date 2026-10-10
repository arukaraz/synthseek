import type { NotificationCatalog, NotificationDestination } from "../types";

export function makeCatalog(overrides: Partial<NotificationCatalog> = {}): NotificationCatalog {
  return {
    channels: ["discord", "ntfy", "telegram", "webhook", "apprise"],
    categories: [
      { id: "downloads", kinds: ["track_completed", "album_failed"] },
      { id: "maintenance", kinds: ["review_new", "quarantine_new"] },
    ],
    canFollowAllRequests: true,
    ntfyServers: null,
    ...overrides,
  };
}

export function makeMemberCatalog(): NotificationCatalog {
  return makeCatalog({
    channels: ["discord", "ntfy", "telegram"],
    categories: [{ id: "downloads", kinds: ["track_completed", "album_failed"] }],
    canFollowAllRequests: false,
    ntfyServers: ["https://ntfy.sh"],
  });
}

export function makeDestination(overrides: Partial<NotificationDestination> = {}): NotificationDestination {
  return {
    channel: "ntfy",
    configured: true,
    enabled: true,
    config: { serverUrl: "https://ntfy.sh", topic: "synthseek-probe", accessToken: "" },
    kinds: ["track_completed"],
    allRequests: false,
    lastFailure: null,
    lastFailureCode: null,
    lastFailureAt: null,
    lastDeliveredAt: null,
    ...overrides,
  };
}
