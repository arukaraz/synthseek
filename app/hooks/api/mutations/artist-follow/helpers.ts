import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { toast } from "sonner";

import type { FollowList } from "@hooks/api/queries/artist-follow/types";
import { errorToast, extractAppCode } from "@modules/errors";
import { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

export function invalidateFollowViews(utils: Utils): void {
  void utils.artistFollow.status.invalidate();
  void utils.artistFollow.list.invalidate();
  void utils.artistFollow.calendar.invalidate();
  void utils.artistFollow.mostPlayed.invalidate();
  void utils.widgets.data.invalidate();
}

export function reportFollowError(error: unknown, message: string): void {
  if (extractAppCode(error)) {
    errorToast(error);
    return;
  }
  toast.error(message);
}

export function patchCachedAutoRequest(
  queryClient: QueryClient,
  utils: Utils,
  ids: readonly string[],
  autoRequest: boolean
): void {
  const targets = new Set(ids);
  queryClient.setQueriesData<FollowList>({ queryKey: getQueryKey(trpc.artistFollow.list) }, (old) =>
    old
      ? {
          ...old,
          items: old.items.map((item) => (targets.has(item.catalogArtistId) ? { ...item, autoRequest } : item)),
        }
      : old
  );
  for (const id of ids) {
    utils.artistFollow.status.setData({ catalogArtistId: id }, (old) => (old ? { ...old, autoRequest } : old));
  }
}
