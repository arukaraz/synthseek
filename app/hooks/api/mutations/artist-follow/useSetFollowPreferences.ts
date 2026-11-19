import i18n from "@locale";
import { trpc } from "@utils/trpc";

import { invalidateFollowViews, reportFollowError } from "./helpers";

export function useSetFollowPreferences() {
  const utils = trpc.useUtils();

  return trpc.artistFollow.setPreferences.useMutation({
    onMutate: async (types) => {
      await utils.artistFollow.preferences.cancel();
      const previous = utils.artistFollow.preferences.getData();
      utils.artistFollow.preferences.setData(undefined, (old) => (old ? { ...old, types } : old));
      return { previous };
    },
    onError: (error, _types, context) => {
      if (context?.previous) utils.artistFollow.preferences.setData(undefined, context.previous);
      reportFollowError(error, i18n.t("follows:control.saveFailed"));
    },
    onSettled: () => {
      void utils.artistFollow.preferences.invalidate();
      invalidateFollowViews(utils);
    },
  });
}
