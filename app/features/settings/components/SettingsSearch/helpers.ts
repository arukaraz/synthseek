import type { TFunction } from "i18next";

import { foldText, matchesTerms, searchTerms } from "@utils/search";

import { SETTINGS_PAGE_BY_ID } from "../../constants";
import type { SettingsPaletteAction, SettingsSearchEntry, SettingsSearchResult } from "../../types";
import type { HighlightPart } from "./types";

export function visibleTo(isAdmin: boolean, entry: Pick<SettingsSearchEntry, "page" | "adminOnly">): boolean {
  if (isAdmin) return true;
  return SETTINGS_PAGE_BY_ID[entry.page].group !== "server" && !entry.adminOnly;
}

function placeOf(entry: SettingsSearchEntry, t: TFunction<"settings">): string {
  const page = t(SETTINGS_PAGE_BY_ID[entry.page].labelKey);
  return entry.placeKey ? t("shell.search.place", { page, place: t(entry.placeKey) }) : page;
}

export function entryHref(entry: SettingsSearchEntry): string {
  return entry.anchor ? `${entry.href}#${entry.anchor}` : entry.href;
}

export function searchSettings(
  query: string,
  entries: readonly SettingsSearchEntry[],
  t: TFunction<"settings">,
  isAdmin: boolean
): SettingsSearchResult[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [];
  const byLabel: SettingsSearchResult[] = [];
  const byContext: SettingsSearchResult[] = [];
  for (const entry of entries) {
    if (!visibleTo(isAdmin, entry)) continue;
    const label = t(entry.labelKey);
    const place = placeOf(entry, t);
    const keywords = entry.keywordsKey ? t(entry.keywordsKey) : "";
    if (matchesTerms(terms, [label])) byLabel.push({ entry, label, place });
    else if (matchesTerms(terms, [label, place, keywords])) byContext.push({ entry, label, place });
  }
  return [...byLabel, ...byContext];
}

export function matchingActions(
  query: string,
  actions: readonly SettingsPaletteAction[],
  t: TFunction<"settings">,
  isAdmin: boolean
): SettingsPaletteAction[] {
  const terms = searchTerms(query);
  return actions.filter((action) => visibleTo(isAdmin, action) && matchesTerms(terms, [t(action.labelKey)]));
}

export function distinctPlaces(results: readonly SettingsSearchResult[]): number {
  return new Set(results.map((result) => result.place)).size;
}

export function highlightParts(text: string, query: string): HighlightPart[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [{ text, match: false }];
  const characters = [...text];
  const origins: number[] = [];
  let folded = "";
  characters.forEach((character, index) => {
    const piece = character.trim() === "" ? " " : foldText(character);
    for (let unit = 0; unit < piece.length; unit += 1) origins.push(index);
    folded += piece;
  });
  const marks = new Array<boolean>(characters.length).fill(false);
  for (const term of terms) {
    let from = folded.indexOf(term);
    while (from !== -1) {
      for (let at = origins[from]; at <= origins[from + term.length - 1]; at += 1) marks[at] = true;
      from = folded.indexOf(term, from + term.length);
    }
  }
  const parts: HighlightPart[] = [];
  characters.forEach((character, index) => {
    const last = parts.at(-1);
    if (last && last.match === marks[index]) last.text += character;
    else parts.push({ text: character, match: marks[index] });
  });
  return parts;
}
