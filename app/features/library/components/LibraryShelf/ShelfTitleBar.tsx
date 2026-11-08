"use client";

import { useDebouncedDraft } from "@hooks/ui/useDebouncedDraft";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { countActiveFilters } from "../../helpers";
import { ImportLibraryMenu } from "../ImportLibraryMenu";
import {
  shelfCount,
  shelfIconButton,
  shelfSearchCancel,
  shelfSearchField,
  shelfSearchInput,
  shelfSearchRow,
  shelfTitle,
  shelfTitleRow,
  shelfTitleText,
} from "./styles";
import type { ShelfTitleBarProps } from "./types";

export function ShelfTitleBar({ controller, total }: ShelfTitleBarProps) {
  const { t } = useTranslation(["library", "common"]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [input, setInput] = useDebouncedDraft(controller.search, controller.setSearch);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const showSearch = searchOpen || controller.search.length > 0;
  const narrowed = controller.search.length > 0 || countActiveFilters(controller.filters) > 0;

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setInput("");
    controller.setSearch("");
  };

  return (
    <>
      <div className={shelfTitleRow()}>
        <div className={shelfTitleText()}>
          <h1 className={shelfTitle()}>{t("page.shelf.title")}</h1>
          <span className={shelfCount()}>
            {narrowed
              ? t(`page.shelf.matches.${controller.view}`, { count: total })
              : t(`page.counts.${controller.view}`, { count: total })}
          </span>
        </div>
        <ImportLibraryMenu appearance="icon" />
        <button
          type="button"
          className={shelfIconButton({ active: showSearch })}
          onClick={() => (showSearch ? closeSearch() : setSearchOpen(true))}
          aria-label={t("page.toolbar.searchAria")}
          aria-pressed={showSearch}
        >
          <Search className="size-5" />
        </button>
      </div>
      {showSearch ? (
        <div className={shelfSearchRow()}>
          <label className={shelfSearchField()}>
            <Search className="size-4 shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t(controller.config.searchPlaceholderKey)}
              aria-label={t("page.toolbar.searchAria")}
              className={shelfSearchInput()}
            />
            {input ? (
              <button
                type="button"
                className={shelfIconButton()}
                onClick={() => {
                  setInput("");
                  controller.setSearch("");
                  inputRef.current?.focus();
                }}
                aria-label={t("page.shelf.clearSearch")}
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>
          <button type="button" className={shelfSearchCancel()} onClick={closeSearch}>
            {t("common:cancel")}
          </button>
        </div>
      ) : null}
    </>
  );
}
