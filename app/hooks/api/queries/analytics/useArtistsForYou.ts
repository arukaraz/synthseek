import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import i18n from "@locale";
import { trpc } from "@utils/trpc";

import { ARTIST_SUGGESTIONS_EXCLUDE_MAX } from "./constants";
import type { ArtistSuggestion, ArtistSuggestions } from "./types";

function idsOf(items: readonly ArtistSuggestion[]): string[] {
  return items.map((item) => item.artist.id);
}

export function useArtistsForYou(): ArtistSuggestions {
  const utils = trpc.useUtils();
  const query = trpc.analytics.discover.artistsForYou.useQuery(undefined, { trpc: { context: { skipBatch: true } } });
  const [shown, setShown] = useState<ArtistSuggestion[] | null>(null);
  const [pending, setPending] = useState<readonly string[]>([]);
  const seen = useRef<string[]>([]);
  const items = shown ?? query.data;
  const swapping = pending.length > 0;

  const next = useCallback(
    async (current: readonly ArtistSuggestion[], limit?: number) => {
      const exclude = [...new Set([...seen.current, ...idsOf(current)])].slice(-ARTIST_SUGGESTIONS_EXCLUDE_MAX);
      seen.current = exclude;
      return utils.analytics.discover.artistsForYou.fetch(limit === undefined ? { exclude } : { exclude, limit }, {
        staleTime: 0,
      });
    },
    [utils]
  );

  const swap = useCallback(
    async (
      leaving: (current: ArtistSuggestion[]) => string[],
      change: (current: ArtistSuggestion[]) => Promise<ArtistSuggestion[]>
    ) => {
      if (!items || swapping) return;
      setPending(leaving(items));
      try {
        setShown(await change(items));
      } catch {
        toast.error(i18n.t("discover:artistSpotlight.swapFailed"));
      } finally {
        setPending([]);
      }
    },
    [items, swapping]
  );

  const replace = useCallback(
    (artistId: string) =>
      swap(
        () => [artistId],
        async (current) => {
          const [fresh] = await next(current, 1);
          return fresh
            ? current.map((item) => (item.artist.id === artistId ? fresh : item))
            : current.filter((item) => item.artist.id !== artistId);
        }
      ),
    [next, swap]
  );

  const reroll = useCallback(
    () =>
      swap(idsOf, async (current) => {
        const fresh = await next(current);
        if (fresh.length > 0) return fresh;
        seen.current = [];
        const again = await next(current);
        return again.length > 0 ? again : current;
      }),
    [next, swap]
  );

  return { data: items, isLoading: query.isLoading, isError: query.isError, pending, replace, reroll };
}
