import type { RecentAlbum } from "@hooks/api/queries/analytics/types";

export type DownloadedAlbum = RecentAlbum & { source: string; minutes: number };
