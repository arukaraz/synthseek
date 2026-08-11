import { ContentType, type RequestWithTracks } from "@api/__generated__/types";
import { albumTarget, playlistLibraryTarget, type DetailTarget } from "@features/content-detail";
import { titleCase } from "@utils/formatters";

export function formatDelegatedTo(delegatedTo: string | null): string | null {
  const trimmed = delegatedTo?.trim();
  if (!trimmed) return null;
  return titleCase(trimmed);
}

const DETAIL_TARGET_BY_CONTENT_TYPE: Record<ContentType, (request: RequestWithTracks) => DetailTarget | null> = {
  [ContentType.enum.album]: (request) =>
    albumTarget({
      id: request.external_id,
      name: request.name,
      artistName: request.artist,
      cover: request.album_art,
    }),
  [ContentType.enum.playlist]: (request) =>
    playlistLibraryTarget({
      id: request.id,
      name: request.name,
      cover: request.album_art,
    }),
  [ContentType.enum.artist]: () => null,
  [ContentType.enum.track]: () => null,
};

export function requestDetailTarget(request: RequestWithTracks): DetailTarget | null {
  return DETAIL_TARGET_BY_CONTENT_TYPE[request.contentType](request);
}
