"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useSelectTheme } from "@hooks/api/mutations/theme";
import { useThemeState } from "@hooks/api/queries/theme";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { FACTORY_BOOT, FALLBACK_THEME_CONTEXT } from "./constants";
import { asksForFactoryTheme, bootOf, paintTheme, withoutFactoryThemeParam } from "./helpers";
import { ThemeFavicon } from "./ThemeFavicon";
import type { Theme, ThemeContextValue, ThemeDraftPaint, ThemeProviderProps } from "./types";

const ThemeContext = createContext<ThemeContextValue>(FALLBACK_THEME_CONTEXT);

export function ThemeProvider({ boot, children }: ThemeProviderProps) {
  const { currentUser } = useAuthContext();
  const signedIn = currentUser !== null;
  const state = useThemeState(signedIn);
  const selection = useSelectTheme();
  const { mutate } = selection;
  const [draft, setDraft] = useState<ThemeDraftPaint | null>(null);
  const [previewAsked, setPreviewAsked] = useState(false);
  const [factoryAsked, setFactoryAsked] = useState(false);
  const factorySent = useRef(false);

  const custom = state.data?.custom ?? null;
  const stored = state.data === undefined ? boot : bootOf(state.data.theme, custom);
  const choosing = selection.isPending && selection.variables.theme !== "custom" ? selection.variables.theme : null;
  const chosen = choosing === null ? stored : bootOf(choosing, custom);
  const active = factoryAsked ? FACTORY_BOOT : chosen;
  const { theme, fingerprint } = active;
  const previewing = previewAsked && draft !== null && !factoryAsked;
  const showsDraft = draft !== null && !factoryAsked && (previewing || (theme === "custom" && draft.unsaved));
  const painted = showsDraft ? "custom" : theme;
  const base = showsDraft ? draft.base : active.base;
  const scheme = showsDraft ? draft.scheme : active.scheme;
  const draftCss = showsDraft ? draft.css : null;

  useEffect(() => {
    if (asksForFactoryTheme(window.location.search)) setFactoryAsked(true);
  }, []);

  useEffect(() => {
    if (!factoryAsked || !signedIn || factorySent.current) return;
    factorySent.current = true;
    mutate(
      { theme: FACTORY_BOOT.theme },
      {
        onSuccess: () => {
          window.history.replaceState(window.history.state, "", withoutFactoryThemeParam(window.location.href));
          setFactoryAsked(false);
        },
      }
    );
  }, [factoryAsked, signedIn, mutate]);

  useEffect(() => {
    if (signedIn) return;
    setDraft(null);
    setPreviewAsked(false);
  }, [signedIn]);

  useEffect(() => {
    paintTheme(document, { theme: painted, base, scheme, fingerprint }, draftCss);
  }, [painted, base, scheme, fingerprint, draftCss]);

  const select = useCallback((next: Theme) => mutate({ theme: next }), [mutate]);
  const startPreview = useCallback(() => setPreviewAsked(true), []);
  const stopPreview = useCallback(() => setPreviewAsked(false), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      scheme,
      custom,
      isReady: state.data !== undefined,
      isSelecting: selection.isPending,
      select,
      draft,
      applyDraft: setDraft,
      previewing,
      startPreview,
      stopPreview,
    }),
    [theme, scheme, custom, state.data, selection.isPending, select, draft, previewing, startPreview, stopPreview]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeFavicon />
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
