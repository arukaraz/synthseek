import { useQueryClient } from "@tanstack/react-query";

import i18n from "@locale";
import { trpc } from "@utils/trpc";

import { invalidateFollowViews, patchCachedAutoRequest, reportFollowError } from "./helpers";

export function useSetAutoRequest() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.artistFollow.setAutoRequest.useMutation({
    onMutate: async ({ catalogArtistIds, autoRequest }) => {
      await utils.artistFollow.list.cancel();
      patchCachedAutoRequest(queryClient, utils, catalogArtistIds, autoRequest);
      return { catalogArtistIds, autoRequest };
    },
    onError: (error, _input, context) => {
      if (context) patchCachedAutoRequest(queryClient, utils, context.catalogArtistIds, !context.autoRequest);
      reportFollowError(error, i18n.t("follows:control.saveFailed"));
    },
    onSettled: () => invalidateFollowViews(utils),
  });
}
