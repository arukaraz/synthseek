"use client";

import { useEffect, useRef } from "react";

import { useShortcutGate } from "@hooks/ui/useShortcutGate";
import { isTextEntryTarget } from "@utils/text-entry";

import type { SettingsShortcutHandlers } from "../types";

export function useSettingsShortcuts(handlers: SettingsShortcutHandlers) {
  const latest = useRef(handlers);
  const allows = useShortcutGate();

  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        latest.current.onPalette();
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && allows(event) && !isTextEntryTarget(event.target)) {
        event.preventDefault();
        latest.current.onSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [allows]);
}
