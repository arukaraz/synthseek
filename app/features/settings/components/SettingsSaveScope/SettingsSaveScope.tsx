"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { triggerHashTargetGlow } from "@utils/hash-target-glow";

import { internalHrefOf, leavesPage, saveEach, sameEntryState } from "./helpers";
import { LeaveChangesDialog } from "./LeaveChangesDialog";
import type { SaveEntry, SaveRegistry, SaveScopeState, SettingsSaveScopeProps } from "./types";

const SaveRegistryContext = createContext<SaveRegistry | null>(null);
const SaveScopeStateContext = createContext<SaveScopeState | null>(null);

export function useSaveRegistry(): SaveRegistry | null {
  return useContext(SaveRegistryContext);
}

export function useSaveScopeState(): SaveScopeState | null {
  return useContext(SaveScopeStateContext);
}

export function useSettingsNavigate(): (href: string) => void {
  const registry = useContext(SaveRegistryContext);
  const router = useRouter();
  return registry ? registry.navigate : (href) => router.push(href);
}

export function SettingsSaveScope({ children }: SettingsSaveScopeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [entries, setEntries] = useState<Record<string, SaveEntry>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => Object.values(entries).filter((entry) => entry.isDirty), [entries]);
  const dirtyRef = useRef(dirty);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    dirtyRef.current = dirty;
    pathnameRef.current = pathname;
  }, [dirty, pathname]);

  const go = useCallback(
    (href: string) => {
      const samePage = !leavesPage(href, pathnameRef.current);
      router.push(href);
      if (samePage) triggerHashTargetGlow(new URL(href, window.location.origin).hash.slice(1));
    },
    [router]
  );

  const registry = useMemo<SaveRegistry>(
    () => ({
      register: (id, entry) =>
        setEntries((previous) => (sameEntryState(previous[id], entry) ? previous : { ...previous, [id]: entry })),
      unregister: (id) =>
        setEntries((previous) => {
          if (!Object.hasOwn(previous, id)) return previous;
          const { [id]: _removed, ...rest } = previous;
          return rest;
        }),
      navigate: (href) => {
        if (dirtyRef.current.length > 0 && leavesPage(href, pathnameRef.current)) setPending(href);
        else go(href);
      },
    }),
    [go]
  );

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      return await saveEach(dirtyRef.current);
    } finally {
      setSaving(false);
    }
  }, []);

  const cancelAll = useCallback(() => {
    for (const entry of dirtyRef.current) entry.cancel();
  }, []);

  const state = useMemo<SaveScopeState>(
    () => ({
      dirty,
      saving: saving || dirty.some((entry) => entry.isSaving),
      saveDisabled: dirty.some((entry) => entry.saveDisabled),
      saveAll,
      cancelAll,
    }),
    [dirty, saving, saveAll, cancelAll]
  );

  const hasChanges = dirty.length > 0;

  useEffect(() => {
    if (!hasChanges) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const onClick = (event: MouseEvent) => {
      const href = internalHrefOf(event);
      if (href === null || !leavesPage(href, pathnameRef.current)) return;
      event.preventDefault();
      event.stopPropagation();
      setPending(href);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [hasChanges]);

  const leave = (href: string) => {
    setPending(null);
    go(href);
  };

  return (
    <SaveRegistryContext.Provider value={registry}>
      <SaveScopeStateContext.Provider value={state}>
        {children}
        <LeaveChangesDialog
          open={pending !== null}
          busy={state.saving}
          saveDisabled={state.saveDisabled}
          onStay={() => setPending(null)}
          onDiscard={() => {
            cancelAll();
            if (pending !== null) leave(pending);
          }}
          onSave={() => {
            const target = pending;
            void saveAll().then((saved) => {
              if (saved && target !== null) leave(target);
              else setPending(null);
            });
          }}
        />
      </SaveScopeStateContext.Provider>
    </SaveRegistryContext.Provider>
  );
}
