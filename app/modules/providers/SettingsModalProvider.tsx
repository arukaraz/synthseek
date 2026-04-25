"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { SettingsSection } from "@features/settings/SettingsModal/types";
import { DEFAULT_SETTINGS_SECTION } from "@features/settings/SettingsModal/types";

interface SettingsModalContextValue {
  isOpen: boolean;
  section: SettingsSection;
  open: (section?: SettingsSection) => void;
  close: () => void;
  setSection: (section: SettingsSection) => void;
}

const SettingsModalContext = createContext<SettingsModalContextValue | null>(null);

/**
 * Owns the Settings modal open/close + active section state. The modal itself
 * is rendered in the root layout and reads from this context. When the modal
 * is later promoted to a dedicated /settings route, remove this provider and
 * render SettingsLayout directly.
 */
export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState<SettingsSection>(DEFAULT_SETTINGS_SECTION);

  const open = useCallback((next?: SettingsSection) => {
    if (next) setSection(next);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<SettingsModalContextValue>(
    () => ({ isOpen, section, open, close, setSection }),
    [isOpen, section, open, close]
  );

  return <SettingsModalContext.Provider value={value}>{children}</SettingsModalContext.Provider>;
}

export function useSettingsModal(): SettingsModalContextValue {
  const ctx = useContext(SettingsModalContext);
  if (!ctx) throw new Error("useSettingsModal must be used within SettingsModalProvider");
  return ctx;
}
