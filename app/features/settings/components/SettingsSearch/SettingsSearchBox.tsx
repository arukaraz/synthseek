"use client";

import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";

import { SEARCH_INPUT_ID } from "./constants";
import { searchBox, searchClear, searchIcon, searchInput, searchShortcut } from "./styles";
import type { SettingsSearchBoxProps } from "./types";

export function SettingsSearchBox({ value, onChange, onSubmit }: SettingsSearchBoxProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={searchBox()} role="search">
      <Search className={searchIcon()} aria-hidden />
      <Input
        id={SEARCH_INPUT_ID}
        size="sm"
        value={value}
        autoComplete="off"
        spellCheck={false}
        placeholder={t("shell.search.placeholder")}
        aria-label={t("shell.search.label")}
        className={searchInput()}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onChange("");
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      {value ? (
        <button
          type="button"
          className={searchClear()}
          aria-label={t("shell.search.clear")}
          onClick={() => onChange("")}
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className={searchShortcut()} aria-hidden>
          {t("shell.search.shortcut")}
        </kbd>
      )}
    </div>
  );
}
