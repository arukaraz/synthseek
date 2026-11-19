import { useCallback } from "react";
import { toast } from "sonner";

import { TOAST_ACTION_DURATION_MS } from "@components/ui/Toaster/constants";
import type { FollowedRestore } from "@hooks/api/queries/artist-follow/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { invalidateFollowViews } from "./helpers";
import type { UnfollowTarget } from "./types";

export function useUnfollowArtists() {
  const utils = trpc.useUtils();
  const mutation = trpc.artistFollow.unfollow.useMutation({
    onSettled: () => invalidateFollowViews(utils),
  });
  const { mutateAsync } = mutation;

  const restore = useCallback(
    (restores: readonly FollowedRestore[]) => {
      utils.client.artistFollow.restore
        .mutate({ follows: [...restores] })
        .then(() => invalidateFollowViews(utils))
        .catch((error: unknown) => errorToast(error));
    },
    [utils]
  );

  const unfollow = useCallback(
    async (targets: readonly UnfollowTarget[]): Promise<boolean> => {
      try {
        const { unfollowed } = await mutateAsync({ catalogArtistIds: targets.map((target) => target.catalogArtistId) });
        if (unfollowed.length === 0) return true;
        const message =
          targets.length === 1
            ? i18n.t("follows:control.unfollowed", { artist: targets[0]?.name ?? "" })
            : i18n.t("follows:following.unfollowedMany", { count: unfollowed.length });
        toast.success(message, {
          duration: TOAST_ACTION_DURATION_MS,
          action: { label: i18n.t("follows:control.undo"), onClick: () => restore(unfollowed) },
        });
        return true;
      } catch (error) {
        errorToast(error);
        return false;
      }
    },
    [mutateAsync, restore]
  );

  return { unfollow, isPending: mutation.isPending };
}
