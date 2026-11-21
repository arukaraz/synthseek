import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback, useMemo } from "react";

import type { ThemePresetId } from "@theme/contract";
import { trpc } from "@utils/trpc";

const THEME_STATE_STALE_MS = 60 * 1000;

export function useThemeState(enabled: boolean) {
  return trpc.theme.state.useQuery(undefined, { enabled, staleTime: THEME_STATE_STALE_MS });
}

export function useForgetTheme() {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.resetQueries({ queryKey: getQueryKey(trpc.theme) }), [queryClient]);
}

export function useThemeFiles(enabled: boolean) {
  return trpc.theme.files.useQuery(undefined, { enabled, refetchOnMount: "always" });
}

export function useThemeHistory(path: string | null) {
  return trpc.theme.history.useQuery({ path: path ?? "" }, { enabled: path !== null, refetchOnMount: "always" });
}

export function useThemeFonts(enabled: boolean) {
  return trpc.theme.fonts.useQuery(undefined, { enabled });
}

export function useThemeFetchers() {
  const utils = trpc.useUtils();
  return useMemo(
    () => ({
      files: () => utils.theme.files.fetch(undefined, { staleTime: 0 }),
      version: (path: string, id: string) => utils.theme.version.fetch({ path, id }),
      preset: (preset: ThemePresetId) => utils.theme.preset.fetch({ preset }),
    }),
    [utils]
  );
}
