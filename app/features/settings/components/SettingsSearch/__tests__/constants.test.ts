import { describe, expect, it } from "vitest";
import type { ParseKeys } from "i18next";

import i18n from "@modules/i18n";

import { SETTINGS_PAGE_BY_ID } from "../../../constants";
import { SETTINGS_PALETTE_ACTIONS, SETTINGS_SEARCH_ENTRIES } from "../constants";

const t = i18n.getFixedT("en", "settings");

function isInsidePage(href: string, pageHref: string): boolean {
  const path = new URL(href, window.location.origin).pathname;
  return href.startsWith(pageHref) && (path === pageHref || path.startsWith(`${pageHref}/`));
}

function resolvesToCopy(key: ParseKeys<"settings">): boolean {
  const value = t(key, { returnObjects: true });
  return typeof value === "string" && value.length > 0 && value !== key;
}

const entryKeys = SETTINGS_SEARCH_ENTRIES.flatMap((entry) =>
  [entry.labelKey, entry.placeKey, entry.keywordsKey].filter((key) => key !== undefined)
);

describe("SETTINGS_SEARCH_ENTRIES", () => {
  it("is not empty", () => {
    expect(SETTINGS_SEARCH_ENTRIES.length).toBeGreaterThan(0);
  });

  it.each(entryKeys)("resolves %s to English copy", (key) => {
    expect(resolvesToCopy(key)).toBe(true);
  });

  it.each(SETTINGS_SEARCH_ENTRIES.map((entry) => [entry.labelKey, entry.page, entry.href] as const))(
    "places %s inside its page %s",
    (_label, page, href) => {
      expect(isInsidePage(href, SETTINGS_PAGE_BY_ID[page].href)).toBe(true);
    }
  );

  it("never repeats the same label at the same destination", () => {
    const destinations = SETTINGS_SEARCH_ENTRIES.map(
      (entry) => `${entry.href}#${entry.anchor ?? ""}:${entry.labelKey}`
    );
    expect(new Set(destinations).size).toBe(destinations.length);
  });
});

describe("SETTINGS_PALETTE_ACTIONS", () => {
  it.each(SETTINGS_PALETTE_ACTIONS.map((action) => [action.id, action.labelKey] as const))(
    "resolves the label of %s",
    (_id, key) => {
      expect(resolvesToCopy(key)).toBe(true);
    }
  );

  it.each(SETTINGS_PALETTE_ACTIONS.map((action) => [action.id, action.page, action.href] as const))(
    "points %s inside its page %s",
    (_id, page, href) => {
      expect(isInsidePage(href, SETTINGS_PAGE_BY_ID[page].href)).toBe(true);
    }
  );
});
