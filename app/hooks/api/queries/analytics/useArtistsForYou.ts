import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import i18n from "@locale";
import { trpc } from "@utils/trpc";

import { arrangeInSlots, sameOrder, suggestionIds } from "./helpers";
import type { ArtistSuggestions } from "./types";

export function useArtistsForYou(): ArtistSuggestions {
  const utils = trpc.useUtils();
  const query = trpc.analytics.discover.artistsForYou.useQuery(undefined, { trpc: { context: { skipBatch: true } } });
  const passOver = trpc.analytics.discover.passOverArtists.useMutation();
  const [slots, setSlots] = useState<readonly string[]>([]);
  const [pending, setPending] = useState<readonly string[]>([]);
  const suggestions = query.data;
  const items = useMemo(
    () => (suggestions === undefined ? undefined : arrangeInSlots(slots, suggestions)),
    [slots, suggestions]
  );
  const shown = items === undefined ? slots : suggestionIds(items);
  if (!sameOrder(slots, shown)) setSlots(shown);
  const swapping = pending.length > 0;
  const { mutateAsync } = passOver;

  const pass = useCallback(
    async (ids: readonly string[]) => {
      if (ids.length === 0 || swapping) return;
      setPending(ids);
      try {
        const fresh = await mutateAsync({ ids: [...ids] });
        if (fresh.length > 0 || ids.length < shown.length)
          utils.analytics.discover.artistsForYou.setData(undefined, fresh);
      } catch {
        toast.error(i18n.t("discover:artistSpotlight.swapFailed"));
      } finally {
        setPending([]);
      }
    },
    [mutateAsync, shown, swapping, utils]
  );

  const replace = useCallback((artistId: string) => pass([artistId]), [pass]);
  const reroll = useCallback(() => pass(shown), [pass, shown]);

  return { data: items, isLoading: query.isLoading, isError: query.isError, pending, replace, reroll };
}
