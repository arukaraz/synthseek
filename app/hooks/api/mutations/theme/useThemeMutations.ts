import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { keepAnswer } from "./helpers";

export function useSelectTheme() {
  const utils = trpc.useUtils();
  return trpc.theme.select.useMutation({
    onSuccess: async (state) => {
      await keepAnswer(utils.theme.state, state);
      void utils.theme.files.invalidate();
    },
    onError: (error) => errorToast(error, "theme.selectFailed"),
  });
}

export function useSaveTheme() {
  const utils = trpc.useUtils();
  return trpc.theme.save.useMutation({
    onSuccess: async (state) => {
      await keepAnswer(utils.theme.state, state);
      void utils.theme.files.invalidate();
      void utils.theme.history.invalidate();
    },
    onError: (error) => errorToast(error, "theme.saveFailed"),
  });
}

export function useCheckTheme() {
  return trpc.theme.check.useMutation();
}

export function useCheckThemeImport() {
  return trpc.theme.checkImport.useMutation({
    onError: (error) => errorToast(error, "theme.importCheckFailed"),
  });
}

export function useRemoveThemeFont() {
  const utils = trpc.useUtils();
  return trpc.theme.removeFont.useMutation({
    onSuccess: (fonts) => keepAnswer(utils.theme.fonts, fonts),
    onError: (error) => errorToast(error, "theme.fontRemoveFailed"),
  });
}
