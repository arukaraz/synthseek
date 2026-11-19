"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { albumRequestItem, albumTarget, artistTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { requestLinkFor } from "@utils/request-helpers";

import type { ReleaseActions } from "../types";

export function useReleaseActions(): ReleaseActions {
  const router = useRouter();
  const { openForTarget, requestResult } = useContentRequestFlow();
  const { playEntity } = useEntityPlayback();

  return useMemo<ReleaseActions>(
    () => ({
      request: (album, intent) =>
        requestResult(
          albumRequestItem({
            id: album.catalogAlbumId,
            name: album.title,
            artistName: album.artistName,
            cover: album.cover,
          }),
          intent
        ),
      play: (album) => void playEntity({ kind: "album", albumExternalId: album.catalogAlbumId }),
      viewRequest: (album) => router.push(requestLinkFor(album.catalogAlbumId)),
      openAlbum: (album) =>
        openForTarget(
          albumTarget({
            id: album.catalogAlbumId,
            name: album.title,
            artistName: album.artistName,
            cover: album.cover,
          })
        ),
      openArtist: (artist) =>
        openForTarget(artistTarget({ id: artist.catalogArtistId, name: artist.name, cover: artist.cover })),
    }),
    [router, openForTarget, requestResult, playEntity]
  );
}
