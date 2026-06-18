"use client";

import { artistRequestItem } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useResolveArtistFetcher } from "@hooks/api/queries/content-detail";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useResolveArtistAndOpen() {
  const { t } = useTranslation("contentDetail");
  const { openForResult } = useContentRequestFlow();
  const resolveArtist = useResolveArtistFetcher();
  const resolvingRef = useRef(false);

  return useCallback(
    async (name: string) => {
      if (resolvingRef.current) return;
      resolvingRef.current = true;
      try {
        const resolved = await resolveArtist(name);
        if (!resolved) {
          toast.error(t("resolveArtistFailed"));
          return;
        }
        openForResult(artistRequestItem({ id: resolved.deezerArtistId, name: resolved.name }));
      } finally {
        resolvingRef.current = false;
      }
    },
    [resolveArtist, openForResult, t]
  );
}
