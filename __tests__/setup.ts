import { vi } from "vitest";

export const mockNavigator = (language = "en-US") => {
  Object.defineProperty(globalThis, "navigator", {
    value: { language, languages: [language] },
    writable: true,
    configurable: true,
  });
};

export const resetNavigator = () => {
  Object.defineProperty(globalThis, "navigator", {
    value: undefined,
    writable: true,
    configurable: true,
  });
};

export const setupTimers = () => {
  vi.useFakeTimers();
  return () => vi.useRealTimers();
};

export const advanceTimers = (ms: number) => {
  vi.advanceTimersByTime(ms);
};

export const createMockDate = (date: string | Date): Date => {
  return new Date(date);
};

export const fixedDate = (isoString: string) => {
  const date = new Date(isoString);
  vi.setSystemTime(date);
  return date;
};
