"use client";

import { useResolveArtistFetcher } from "@hooks/api/queries/content-detail";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { TracklistTrack } from "../components/Tracklist/types";
import { artistTarget } from "../helpers";
import type { DetailTarget } from "../types";

export function useTrackArtistNavigation(onNavigate: (target: DetailTarget) => void) {
  const { t } = useTranslation("contentDetail");
  const resolveArtist = useResolveArtistFetcher();
  const resolvingRef = useRef(false);

  const navigate = useCallback(
    async (track: TracklistTrack) => {
      if (track.artistExternalId !== null) {
        onNavigate(artistTarget({ id: track.artistExternalId, name: track.artist, cover: null }));
        return;
      }
      if (resolvingRef.current) return;
      resolvingRef.current = true;
      try {
        const resolved = await resolveArtist(track.artist).catch(() => null);
        if (!resolved) {
          toast.error(t("resolveArtistFailed"));
          return;
        }
        onNavigate(artistTarget({ id: resolved.catalogArtistId, name: resolved.name, cover: resolved.image }));
      } finally {
        resolvingRef.current = false;
      }
    },
    [onNavigate, resolveArtist, t]
  );

  return useCallback((track: TracklistTrack) => void navigate(track), [navigate]);
}
