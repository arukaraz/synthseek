import { keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { DEFAULT_LOCALE, isLocale } from "@locale/config";
import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistStatsArgs {
  artistName: string;
  mbid: string | null;
  catalogArtistId: string;
  enabled?: boolean;
}

export function useArtistStats({ artistName, mbid, catalogArtistId, enabled = true }: UseArtistStatsArgs) {
  const { i18n } = useTranslation();
  const language = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;

  return trpc.contentDetail.artistStats.useQuery(
    { artistName, mbid: mbid ?? undefined, catalogArtistId: catalogArtistId || undefined, language },
    {
      enabled: enabled && !!artistName,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      placeholderData: keepPreviousData,
      trpc: { context: { skipBatch: true } },
    }
  );
}
