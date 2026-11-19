import i18n from "@locale";
import { trpc } from "@utils/trpc";

import { invalidateFollowViews, reportFollowError } from "./helpers";

export function useFollowArtist(artistName: string) {
  const utils = trpc.useUtils();

  return trpc.artistFollow.follow.useMutation({
    onMutate: async (input) => {
      const key = { catalogArtistId: input.catalogArtistId };
      await utils.artistFollow.status.cancel(key);
      const previous = utils.artistFollow.status.getData(key);
      utils.artistFollow.status.setData(key, {
        followable: true,
        following: true,
        autoRequest: input.autoRequest ?? false,
        followedAt: new Date(),
      });
      return { previous };
    },
    onError: (error, input, context) => {
      if (context?.previous) {
        utils.artistFollow.status.setData({ catalogArtistId: input.catalogArtistId }, context.previous);
      }
      reportFollowError(error, i18n.t("follows:control.followFailed", { artist: artistName }));
    },
    onSettled: () => invalidateFollowViews(utils),
  });
}
