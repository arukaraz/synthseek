import { useEffect, useState } from "react";

interface UseDebounceOptions {
  delay?: number;
}

export function useDebounce<T>(value: T, options: UseDebounceOptions = {}): T {
  const { delay = 300 } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
