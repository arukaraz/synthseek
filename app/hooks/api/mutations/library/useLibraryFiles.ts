import type { inferRouterOutputs } from "@trpc/server";
import { toast } from "sonner";

import type { AppRouter } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

type FileJobStart = inferRouterOutputs<AppRouter>["library"]["files"]["move"];

function announceRefusal(result: FileJobStart): void {
  switch (result.outcome) {
    case "started":
      return;
    case "busy":
      toast.warning(i18n.t("library:files.outcome.busy"));
      return;
    case "nothing_to_do":
      toast.info(i18n.t("library:files.outcome.nothingToDo"));
      return;
    case "not_found":
      toast.error(i18n.t("library:files.outcome.notFound"));
      return;
    case "target_unavailable":
      toast.warning(i18n.t("library:files.outcome.targetUnavailable"));
      return;
  }
}

export function useMoveLibraryFiles() {
  const utils = trpc.useUtils();
  return trpc.library.files.move.useMutation({
    onSuccess: (result) => {
      if (result.outcome === "started") void utils.library.files.status.invalidate();
      announceRefusal(result);
    },
    onError: (error) => errorToast(error),
  });
}

export function useDeleteLibraryFiles() {
  const utils = trpc.useUtils();
  return trpc.library.files.delete.useMutation({
    onSuccess: (result) => {
      if (result.outcome === "started") void utils.library.files.status.invalidate();
      announceRefusal(result);
    },
    onError: (error) => errorToast(error),
  });
}
