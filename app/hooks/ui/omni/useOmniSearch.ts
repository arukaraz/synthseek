"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { useLocalStorage } from "../useLocalStorage";
import { RECENT_SEARCHES_KEY } from "./constants";
import {
  cycleScope,
  isApplePlatform,
  isRecentSearches,
  isSearchShortcut,
  parseRecentSearches,
  stepHighlight,
  withRecentSearch,
} from "./helpers";
import type { OmniSearchState, UseOmniSearchOptions } from "./types";

export function useOmniSearch<TScope extends string>({
  initialQuery,
  initialScope,
  scopes,
  shortcutEnabled,
  onSubmit,
}: UseOmniSearchOptions<TScope>): OmniSearchState<TScope> {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initialQuery);
  const [scope, setScope] = useState(initialScope);
  const [highlighted, setHighlighted] = useState(-1);
  const [recentRaw, setRecentRaw] = useLocalStorage(RECENT_SEARCHES_KEY, "[]", isRecentSearches);
  const recent = useMemo(() => parseRecentSearches(recentRaw) ?? [], [recentRaw]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [appleKeys, setAppleKeys] = useState(false);

  useEffect(() => {
    setAppleKeys(isApplePlatform(navigator.userAgent));
  }, []);

  useEffect(() => {
    setDraft(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setScope(initialScope);
  }, [initialScope]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const openSearch = useCallback(() => {
    setOpen(true);
    inputRef.current?.focus();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.blur();
  }, []);

  const changeDraft = useCallback((value: string) => {
    setDraft(value);
    setHighlighted(-1);
  }, []);

  const changeScope = useCallback((next: TScope) => {
    setScope(next);
    setHighlighted(-1);
  }, []);

  const remember = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (trimmed) setRecentRaw(JSON.stringify(withRecentSearch(recent, trimmed)));
    },
    [recent, setRecentRaw]
  );

  const submit = useCallback(
    (query?: string) => {
      const trimmed = (query ?? draft).trim();
      if (!trimmed) return;
      remember(trimmed);
      setDraft(trimmed);
      onSubmit(trimmed, scope);
      close();
    },
    [close, draft, onSubmit, remember, scope]
  );

  useEffect(() => {
    if (!shortcutEnabled) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || !isSearchShortcut(event)) return;
      event.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, shortcutEnabled]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, optionCount: number, activate: (index: number) => void) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((current) => stepHighlight(current, optionCount, event.key === "ArrowDown" ? 1 : -1));
      } else if (event.key === "Tab") {
        event.preventDefault();
        changeScope(cycleScope(scopes, scope, event.shiftKey ? -1 : 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (highlighted >= 0 && highlighted < optionCount) activate(highlighted);
        else submit();
      }
    },
    [changeScope, close, highlighted, scope, scopes, submit]
  );

  return {
    open,
    draft,
    scope,
    recent,
    highlighted,
    inputRef,
    appleKeys,
    shortcutEnabled,
    openSearch,
    close,
    changeDraft,
    changeScope,
    highlight: setHighlighted,
    remember,
    submit,
    handleKeyDown,
  };
}
