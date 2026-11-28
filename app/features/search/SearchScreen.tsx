"use client";

import { useTranslation } from "react-i18next";

import { SearchResultsWidget } from "./components/SearchResultsWidget/SearchResultsWidget";

export function SearchScreen() {
  const { t } = useTranslation("components");

  return (
    <>
      <h1 className="sr-only">{t("header.search")}</h1>
      <SearchResultsWidget />
    </>
  );
}
