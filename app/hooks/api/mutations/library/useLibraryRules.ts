import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useCreateLibraryRule() {
  const utils = trpc.useUtils();
  return trpc.library.rules.create.useMutation({
    onSuccess: (result) => {
      if (result.outcome !== "saved") return;
      utils.library.rules.list.invalidate();
      toast.success(i18n.t("settings:libraryRules.toast.added"));
    },
    onError: (error) => errorToast(error, "settings.libraryRuleFailed"),
  });
}

export function useUpdateLibraryRule() {
  const utils = trpc.useUtils();
  return trpc.library.rules.update.useMutation({
    onSuccess: (result) => {
      if (result.outcome === "saved") {
        utils.library.rules.list.invalidate();
        toast.success(i18n.t("settings:libraryRules.toast.saved"));
        return;
      }
      if (result.outcome === "not_found") {
        utils.library.rules.list.invalidate();
        toast.warning(i18n.t("settings:libraryRules.toast.notFound"));
      }
    },
    onError: (error) => errorToast(error, "settings.libraryRuleFailed"),
  });
}

export function useRemoveLibraryRule() {
  const utils = trpc.useUtils();
  return trpc.library.rules.remove.useMutation({
    onSuccess: (result) => {
      utils.library.rules.list.invalidate();
      utils.library.paths.list.invalidate();
      if (result.outcome === "removed") {
        toast.success(i18n.t("settings:libraryRules.toast.removed"));
        return;
      }
      toast.warning(i18n.t("settings:libraryRules.toast.notFound"));
    },
    onError: (error) => errorToast(error, "settings.libraryRuleFailed"),
  });
}

export function useReorderLibraryRules() {
  const utils = trpc.useUtils();
  return trpc.library.rules.reorder.useMutation({
    onMutate: async ({ ids }) => {
      await utils.library.rules.list.cancel();
      const before = utils.library.rules.list.getData();
      utils.library.rules.list.setData(undefined, (rules) => {
        if (rules === undefined) return rules;
        return ids.flatMap((id, position) => {
          const rule = rules.find((entry) => entry.id === id);
          return rule === undefined ? [] : [{ ...rule, position }];
        });
      });
      return { before };
    },
    onSuccess: (result) => {
      if (result.outcome === "mismatch") toast.warning(i18n.t("settings:libraryRules.toast.reorderMismatch"));
    },
    onError: (error, _input, context) => {
      if (context?.before !== undefined) utils.library.rules.list.setData(undefined, context.before);
      errorToast(error, "settings.libraryRuleFailed");
    },
    onSettled: () => {
      utils.library.rules.list.invalidate();
    },
  });
}
