import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useCreateLibraryPath() {
  const utils = trpc.useUtils();
  return trpc.library.paths.create.useMutation({
    onSuccess: (result) => {
      utils.library.rules.list.invalidate();
      if (result.outcome === "saved") {
        utils.library.paths.list.invalidate();
        toast.success(i18n.t("settings:libraryPaths.toast.added"));
        return;
      }
      if (result.outcome === "not_found") {
        utils.library.paths.list.invalidate();
        toast.warning(i18n.t("settings:libraryPaths.toast.notFound"));
      }
    },
    onError: (error) => errorToast(error, "settings.libraryPathFailed"),
  });
}

export function useUpdateLibraryPath() {
  const utils = trpc.useUtils();
  return trpc.library.paths.update.useMutation({
    onSuccess: (result) => {
      utils.library.rules.list.invalidate();
      if (result.outcome === "saved") {
        utils.library.paths.list.invalidate();
        utils.library.naming.preview.invalidate();
        toast.success(i18n.t("settings:libraryPaths.toast.saved"));
        return;
      }
      if (result.outcome === "not_found") {
        utils.library.paths.list.invalidate();
        toast.warning(i18n.t("settings:libraryPaths.toast.notFound"));
      }
    },
    onError: (error) => errorToast(error, "settings.libraryPathFailed"),
  });
}

export function useSetLibraryPathEnabled() {
  const utils = trpc.useUtils();
  return trpc.library.paths.setEnabled.useMutation({
    onMutate: async ({ id, enabled }) => {
      await utils.library.paths.list.cancel();
      const before = utils.library.paths.list.getData();
      utils.library.paths.list.setData(undefined, (paths) =>
        paths?.map((path) => (path.id === id ? { ...path, enabled } : path))
      );
      return { before };
    },
    onSuccess: (result) => {
      if (result.outcome === "default_path") {
        toast.warning(i18n.t("settings:libraryPaths.toast.defaultCannotTurnOff"));
        return;
      }
      if (result.outcome === "not_found") {
        toast.warning(i18n.t("settings:libraryPaths.toast.notFound"));
      }
    },
    onError: (error, _input, context) => {
      if (context?.before !== undefined) utils.library.paths.list.setData(undefined, context.before);
      errorToast(error, "settings.libraryPathFailed");
    },
    onSettled: () => {
      utils.library.paths.list.invalidate();
    },
  });
}

export function useRemoveLibraryPath() {
  const utils = trpc.useUtils();
  return trpc.library.paths.remove.useMutation({
    onSuccess: (result) => {
      if (result.outcome === "blocked") return;
      utils.library.paths.list.invalidate();
      utils.library.rules.list.invalidate();
      if (result.outcome === "removed") {
        toast.success(i18n.t("settings:libraryPaths.toast.removed"));
        return;
      }
      toast.warning(i18n.t("settings:libraryPaths.toast.notFound"));
    },
    onError: (error) => errorToast(error, "settings.libraryPathFailed"),
  });
}
