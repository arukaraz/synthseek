import { useCallback, useEffect, useState } from "react";

export function useLocalStorage(
  key: string,
  defaultValue: string,
  isValid: (raw: string) => boolean
): [string, (value: string) => void] {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const raw = window.localStorage.getItem(key);
    if (raw !== null && isValid(raw)) {
      setValue(raw);
    }
  }, [key, isValid]);

  const set = useCallback(
    (next: string) => {
      setValue(next);
      window.localStorage.setItem(key, next);
    },
    [key]
  );

  return [value, set];
}
