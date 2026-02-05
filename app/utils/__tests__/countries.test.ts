import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getCountryByCode,
  isValidCountryCode,
  getValidCountryOrFallback,
  detectBrowserCountry,
  COUNTRIES,
  DEFAULT_COUNTRY,
} from "../countries";
import { mockNavigatorLanguage, clearNavigator, mockNavigatorWithoutLanguage } from "@test/mocks";

describe("COUNTRIES", () => {
  it("contains expected countries", () => {
    expect(COUNTRIES.length).toBeGreaterThan(0);
    expect(COUNTRIES.find((c) => c.code === "US")).toBeDefined();
    expect(COUNTRIES.find((c) => c.code === "JP")).toBeDefined();
    expect(COUNTRIES.find((c) => c.code === "GB")).toBeDefined();
  });

  it("has correct structure for each country", () => {
    COUNTRIES.forEach((country) => {
      expect(country).toHaveProperty("code");
      expect(country).toHaveProperty("name");
      expect(country).toHaveProperty("flag");
      expect(country.code.length).toBe(2);
    });
  });
});

describe("DEFAULT_COUNTRY", () => {
  it("is US", () => {
    expect(DEFAULT_COUNTRY).toBe("US");
  });
});

describe("getCountryByCode", () => {
  it("returns country for valid code US", () => {
    const country = getCountryByCode("US");
    expect(country).toBeDefined();
    expect(country?.name).toBe("United States");
    expect(country?.flag).toBe("🇺🇸");
  });

  it("returns country for valid code JP", () => {
    const country = getCountryByCode("JP");
    expect(country).toBeDefined();
    expect(country?.name).toBe("Japan");
  });

  it("returns undefined for invalid code", () => {
    expect(getCountryByCode("XX")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getCountryByCode("")).toBeUndefined();
  });

  it("is case sensitive (lowercase returns undefined)", () => {
    expect(getCountryByCode("us")).toBeUndefined();
  });
});

describe("isValidCountryCode", () => {
  it("returns true for valid country code US", () => {
    expect(isValidCountryCode("US")).toBe(true);
  });

  it("returns true for valid country code JP", () => {
    expect(isValidCountryCode("JP")).toBe(true);
  });

  it("returns true for valid country code MX", () => {
    expect(isValidCountryCode("MX")).toBe(true);
  });

  it("returns false for invalid code XX", () => {
    expect(isValidCountryCode("XX")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidCountryCode("")).toBe(false);
  });

  it("returns false for lowercase valid code", () => {
    expect(isValidCountryCode("us")).toBe(false);
  });

  it("returns false for partial code", () => {
    expect(isValidCountryCode("U")).toBe(false);
  });
});

describe("detectBrowserCountry", () => {
  afterEach(() => {
    clearNavigator();
  });

  it("returns US when navigator is undefined (server-side)", () => {
    clearNavigator();
    expect(detectBrowserCountry()).toBe("US");
  });

  it("detects US from en-US locale", () => {
    mockNavigatorLanguage("en-US");
    expect(detectBrowserCountry()).toBe("US");
  });

  it("detects JP from ja-JP locale", () => {
    mockNavigatorLanguage("ja-JP");
    expect(detectBrowserCountry()).toBe("JP");
  });

  it("detects GB from en-GB locale", () => {
    mockNavigatorLanguage("en-GB");
    expect(detectBrowserCountry()).toBe("GB");
  });

  it("detects MX from es-MX locale", () => {
    mockNavigatorLanguage("es-MX");
    expect(detectBrowserCountry()).toBe("MX");
  });

  it("returns US for locale without country code", () => {
    mockNavigatorLanguage("en");
    expect(detectBrowserCountry()).toBe("US");
  });

  it("returns US for invalid country in locale", () => {
    mockNavigatorLanguage("en-XX");
    expect(detectBrowserCountry()).toBe("US");
  });

  it("returns US when language is empty string", () => {
    mockNavigatorWithoutLanguage();
    expect(detectBrowserCountry()).toBe("US");
  });
});

describe("getValidCountryOrFallback", () => {
  afterEach(() => {
    clearNavigator();
  });

  it("returns the code when it is valid", () => {
    expect(getValidCountryOrFallback("JP")).toBe("JP");
  });

  it("returns detected country when code is invalid", () => {
    mockNavigatorLanguage("en-GB");
    expect(getValidCountryOrFallback("XX")).toBe("GB");
  });

  it("returns detected country when code is null", () => {
    mockNavigatorLanguage("ja-JP");
    expect(getValidCountryOrFallback(null)).toBe("JP");
  });

  it("returns detected country when code is undefined", () => {
    mockNavigatorLanguage("es-MX");
    expect(getValidCountryOrFallback(undefined)).toBe("MX");
  });

  it("returns US when code is invalid and no browser locale", () => {
    clearNavigator();
    expect(getValidCountryOrFallback("XX")).toBe("US");
  });

  it("returns detected country when code is empty string", () => {
    mockNavigatorLanguage("en-US");
    expect(getValidCountryOrFallback("")).toBe("US");
  });
});
