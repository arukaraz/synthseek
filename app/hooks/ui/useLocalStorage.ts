import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useLocalStorage(
  key: string,
  defaultValue: string,
  isValid: (raw: string) => boolean
): [string, (value: string) => void] {
  const read = useCallback(() => {
    const raw = window.localStorage.getItem(key);
    return raw !== null && isValid(raw) ? raw : defaultValue;
  }, [key, defaultValue, isValid]);

  const value = useSyncExternalStore(subscribe, read, () => defaultValue);

  const set = useCallback(
    (next: string) => {
      window.localStorage.setItem(key, next);
      listeners.forEach((listener) => listener());
    },
    [key]
  );

  return [value, set];
}
