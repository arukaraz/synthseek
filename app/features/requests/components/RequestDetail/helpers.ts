import {
  ContentType,
  type ActiveRelease,
  type RequestContainerType,
  type RequestListItem,
} from "@api/__generated__/types";
import { albumTarget, playlistLibraryTarget, type DetailTarget } from "@features/content-detail";
import { titleCase } from "@utils/formatters";

import type { ReleaseFigureFormat } from "./types";

export function releaseFigures(release: ActiveRelease, format: ReleaseFigureFormat): string[] {
  const figures: string[] = [];
  if (release.totalBytes > 0) figures.push(format.size(release.doneBytes, release.totalBytes));
  if (release.etaMinutes !== null) figures.push(format.eta(release.etaMinutes));
  return figures;
}

export function formatDelegatedTo(delegatedTo: string | null): string | null {
  const trimmed = delegatedTo?.trim();
  if (!trimmed) return null;
  return titleCase(trimmed);
}

const DETAIL_TARGET_BY_CONTENT_TYPE: Record<RequestContainerType, (request: RequestListItem) => DetailTarget | null> = {
  [ContentType.enum.album]: (request) =>
    albumTarget({
      id: request.external_id,
      name: request.name,
      artistName: request.credited_artist,
      cover: request.album_art,
    }),
  [ContentType.enum.playlist]: (request) =>
    playlistLibraryTarget({
      id: request.id,
      name: request.name,
      cover: request.album_art,
    }),
};

export function requestDetailTarget(request: RequestListItem): DetailTarget | null {
  return DETAIL_TARGET_BY_CONTENT_TYPE[request.contentType](request);
}
