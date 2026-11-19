import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { TOAST_ACTION_DURATION_MS } from "@components/ui/Toaster/constants";
import { FOLLOW_NEWEST_FIRST } from "@hooks/api/queries/artist-follow/constants";
import type { FollowBulkStatus } from "@hooks/api/queries/artist-follow/types";
import { useFollowMostPlayedStatus } from "@hooks/api/queries/artist-follow/useFollowMostPlayedStatus";
import i18n from "@locale";
import { errorToast, extractAppCode } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { invalidateFollowViews } from "./helpers";
import type { FollowRunInput, FollowRunPhase } from "./types";
import { useUnfollowArtists } from "./useUnfollowArtists";

export function useFollowMostPlayed() {
  const utils = trpc.useUtils();
  const start = trpc.artistFollow.followMostPlayed.useMutation();
  const { unfollow } = useUnfollowArtists();
  const [phase, setPhase] = useState<FollowRunPhase>("idle");
  const before = useRef<ReadonlySet<string>>(new Set());
  const status = useFollowMostPlayedStatus(phase === "running");

  const finish = useCallback(
    async (result: FollowBulkStatus) => {
      setPhase("idle");
      invalidateFollowViews(utils);
      const added = await utils.artistFollow.list.fetch(FOLLOW_NEWEST_FIRST).then(
        (after) => after.items.filter((item) => !before.current.has(item.catalogArtistId)),
        () => []
      );
      if (result.followed > 0) {
        const message = i18n.t("follows:mostPlayed.done", { count: result.followed });
        if (added.length === 0) {
          toast.success(message);
        } else {
          toast.success(message, {
            duration: TOAST_ACTION_DURATION_MS,
            action: {
              label: i18n.t("follows:control.undo"),
              onClick: () =>
                void unfollow(added.map((item) => ({ catalogArtistId: item.catalogArtistId, name: item.name }))),
            },
          });
        }
      }
      if (result.notFound > 0) toast.info(i18n.t("follows:mostPlayed.notFound", { count: result.notFound }));
      if (result.failed > 0) toast.warning(i18n.t("follows:mostPlayed.unreached", { count: result.failed }));
    },
    [utils, unfollow]
  );

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (phase === "running" && status.data && !status.data.running) void finishRef.current(status.data);
  }, [phase, status.data]);

  const follow = useCallback(
    async (input: FollowRunInput): Promise<boolean> => {
      try {
        const snapshot = await utils.artistFollow.list.fetch(FOLLOW_NEWEST_FIRST);
        before.current = new Set(snapshot.items.map((item) => item.catalogArtistId));
        const result = await start.mutateAsync(input);
        if (result.running) setPhase("running");
        else await finish(result);
        return true;
      } catch (error) {
        if (extractAppCode(error)) errorToast(error);
        return false;
      }
    },
    [utils, start, finish]
  );

  return { follow, phase, progress: status.data ?? null, isStarting: start.isPending };
}
