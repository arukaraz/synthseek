import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSelectTheme() {
  const utils = trpc.useUtils();
  return trpc.theme.select.useMutation({
    onSuccess: (state) => {
      utils.theme.state.setData(undefined, state);
      void utils.theme.files.invalidate();
    },
    onError: (error) => errorToast(error, "theme.selectFailed"),
  });
}

export function useSaveTheme() {
  const utils = trpc.useUtils();
  return trpc.theme.save.useMutation({
    onSuccess: (state) => {
      utils.theme.state.setData(undefined, state);
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
    onSuccess: (fonts) => utils.theme.fonts.setData(undefined, fonts),
    onError: (error) => errorToast(error, "theme.fontRemoveFailed"),
  });
}
