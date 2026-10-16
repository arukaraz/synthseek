"use client";

import { useTranslation } from "react-i18next";

import { SEARCH_RESULT_LIMIT } from "./constants";
import { distinctPlaces } from "./helpers";
import { HighlightedText } from "./HighlightedText";
import { searchResult, searchResultLabel, searchResultPlace, searchSummary } from "./styles";
import type { SettingsSearchResultsProps } from "./types";

export function SettingsSearchResults({ query, results, onPick }: SettingsSearchResultsProps) {
  const { t } = useTranslation("settings");

  return (
    <>
      <p className={searchSummary()} aria-live="polite">
        {results.length > 0
          ? t("shell.search.summary", { count: results.length, places: distinctPlaces(results) })
          : t("shell.search.empty")}
      </p>
      {results.slice(0, SEARCH_RESULT_LIMIT).map((result) => (
        <button
          key={`${result.entry.href}#${result.entry.anchor ?? ""}:${result.entry.labelKey}`}
          type="button"
          className={searchResult()}
          onClick={() => onPick(result)}
        >
          <span className={searchResultLabel()}>
            <HighlightedText text={result.label} query={query} />
          </span>
          <span className={searchResultPlace()}>{result.place}</span>
        </button>
      ))}
    </>
  );
}
