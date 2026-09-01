import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateLibraryRecycleBin() {
  const utils = trpc.useUtils();
  return trpc.settings.updateLibraryRecycleBin.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.recycleBinSaved"));
    },
    onError: (error) => errorToast(error, "settings.recycleBinSaveFailed"),
  });
}

export function useEmptyRecycleBin() {
  const utils = trpc.useUtils();
  return trpc.settings.recycleBin.empty.useMutation({
    onSuccess: ({ removedFiles }) => {
      utils.settings.recycleBin.status.invalidate();
      toast.success(i18n.t("mutations:settings.recycleBinEmptied", { count: removedFiles }));
    },
    onError: (error) => errorToast(error, "settings.recycleBinEmptyFailed"),
  });
}

export function useRestoreRecycledFile() {
  const utils = trpc.useUtils();
  return trpc.settings.recycleBin.restore.useMutation({
    onSuccess: ({ relativePath }) => {
      utils.settings.recycleBin.list.invalidate();
      utils.settings.recycleBin.status.invalidate();
      toast.success(i18n.t("mutations:settings.recycledFileRestored", { path: relativePath }));
    },
    onError: (error) => errorToast(error, "settings.recycledFileRestoreFailed"),
  });
}
