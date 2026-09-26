import { useSyncExternalStore } from "react";

function supportsMediaQueries(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (!supportsMediaQueries()) return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => (supportsMediaQueries() ? window.matchMedia(query).matches : fallback),
    () => fallback
  );
}
