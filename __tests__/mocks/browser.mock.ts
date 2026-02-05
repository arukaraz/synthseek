import { vi } from "vitest";

export const mockNavigatorLanguage = (language: string) => {
  Object.defineProperty(globalThis, "navigator", {
    value: {
      language,
      languages: [language],
    },
    writable: true,
    configurable: true,
  });
};

export const mockNavigatorWithoutLanguage = () => {
  Object.defineProperty(globalThis, "navigator", {
    value: {
      language: undefined,
      languages: undefined,
    },
    writable: true,
    configurable: true,
  });
};

export const clearNavigator = () => {
  Object.defineProperty(globalThis, "navigator", {
    value: undefined,
    writable: true,
    configurable: true,
  });
};

export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};
