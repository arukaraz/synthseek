"use client";

import { ChevronRight, CornerDownLeft, Play, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { Input } from "@components/ui/Input";
import { useTriggerJob } from "@hooks/api/mutations/jobs/useTriggerJob";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";

import { SETTINGS_PAGE_BY_ID, SETTINGS_PAGES } from "../../constants";
import { useSettingsNavigate } from "../SettingsSaveScope";
import {
  PALETTE_ACTION_LIMIT,
  PALETTE_RESULT_LIMIT,
  SETTINGS_PALETTE_ACTIONS,
  SETTINGS_SEARCH_ENTRIES,
} from "./constants";
import { entryHref, matchingActions, searchSettings, visibleTo } from "./helpers";
import { HighlightedText } from "./HighlightedText";
import {
  paletteContent,
  paletteGroupLabel,
  paletteHint,
  paletteItem,
  paletteItemIcon,
  paletteItemText,
  paletteList,
  searchIcon,
  searchInput,
  searchResultLabel,
  searchResultPlace,
} from "./styles";
import type { PaletteItem, SettingsPaletteProps } from "./types";

export function SettingsPalette({ open, onOpenChange }: SettingsPaletteProps) {
  const { t } = useTranslation("settings");
  const { isAdmin } = useAuthContext();
  const navigate = useSettingsNavigate();
  const trigger = useTriggerJob();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const close = () => {
    setQuery("");
    setActive(0);
    onOpenChange(false);
  };

  const actions: PaletteItem[] = matchingActions(query, SETTINGS_PALETTE_ACTIONS, t, isAdmin)
    .slice(0, PALETTE_ACTION_LIMIT)
    .map((action) => ({
      kind: "action",
      id: action.id,
      label: t(action.labelKey),
      place: t(SETTINGS_PAGE_BY_ID[action.page].labelKey),
      run: () => {
        navigate(action.href);
        if (action.id === "runLibraryScan") trigger.mutate({ id: "library-scan" });
      },
    }));

  const settings: PaletteItem[] =
    query.trim().length > 0
      ? searchSettings(query, SETTINGS_SEARCH_ENTRIES, t, isAdmin)
          .slice(0, PALETTE_RESULT_LIMIT)
          .map((result) => ({
            kind: "setting",
            id: entryHref(result.entry) + result.entry.labelKey,
            label: result.label,
            place: result.place,
            run: () => navigate(entryHref(result.entry)),
          }))
      : SETTINGS_PAGES.filter((page) => visibleTo(isAdmin, { page: page.id })).map((page) => ({
          kind: "setting",
          id: page.href,
          label: t(page.labelKey),
          place: t(page.descriptionKey),
          run: () => navigate(page.href),
        }));

  const items = [...actions, ...settings];
  const current = Math.min(active, items.length - 1);

  const pick = (item: PaletteItem | undefined) => {
    if (!item) return;
    close();
    item.run();
  };

  const renderItem = (item: PaletteItem, index: number) => {
    const Icon = item.kind === "action" ? Play : ChevronRight;
    return (
      <button
        key={`${item.kind}:${item.id}`}
        type="button"
        className={paletteItem({ active: index === current })}
        onMouseMove={() => setActive(index)}
        onClick={() => pick(item)}
      >
        <Icon className={paletteItemIcon()} aria-hidden />
        <span className={paletteItemText()}>
          <span className={searchResultLabel()}>
            <HighlightedText text={item.label} query={query} />
          </span>
          <span className={searchResultPlace()}>{item.place}</span>
        </span>
        {index === current ? <CornerDownLeft className={paletteItemIcon()} aria-hidden /> : null}
      </button>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className={paletteContent()} showClose={false}>
        <DialogHeader>
          <DialogTitle>{t("shell.palette.title")}</DialogTitle>
          <DialogDescription className="sr-only">{t("shell.palette.description")}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className={searchIcon()} aria-hidden />
          <Input
            autoFocus
            value={query}
            autoComplete="off"
            spellCheck={false}
            placeholder={t("shell.palette.placeholder")}
            aria-label={t("shell.palette.placeholder")}
            className={cn(searchInput(), "pr-3")}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive(Math.min(items.length - 1, current + 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive(Math.max(0, current - 1));
              } else if (event.key === "Enter") {
                event.preventDefault();
                pick(items[current]);
              }
            }}
          />
        </div>
        <div className={paletteList()}>
          {actions.length > 0 ? <p className={paletteGroupLabel()}>{t("shell.palette.actions")}</p> : null}
          {actions.map((item, index) => renderItem(item, index))}
          {settings.length > 0 ? (
            <p className={paletteGroupLabel()}>
              {query.trim().length > 0 ? t("shell.palette.settings") : t("shell.palette.pages")}
            </p>
          ) : null}
          {settings.map((item, index) => renderItem(item, actions.length + index))}
          {items.length === 0 ? <p className={paletteHint()}>{t("shell.palette.empty", { query })}</p> : null}
        </div>
        <p className={paletteHint()}>{t("shell.palette.keys")}</p>
      </DialogContent>
    </Dialog>
  );
}
