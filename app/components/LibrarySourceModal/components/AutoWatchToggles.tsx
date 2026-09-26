"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { Switch } from "@components/ui/Switch";
import { DownloadCloud, Info, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WATCH_ROW_KEYS } from "../constants";
import { watchedKeys } from "../helpers";
import {
  autoImportBadge,
  autoImportPopover,
  autoImportRow,
  autoImportRowLabel,
  autoImportRowSub,
  autoImportTitle,
  autoImportTrigger,
  autoImportTriggerCue,
  autoImportTriggerIcon,
  autoImportTriggerLabel,
} from "../styles";
import type { AutoWatchTogglesProps } from "./types";

export function AutoWatchToggles({ providerName, watch, value, onChange }: AutoWatchTogglesProps) {
  const { t } = useTranslation("library");
  const keys = watchedKeys(watch);
  const activeCount = keys.filter((key) => value[key]).length;
  const active = activeCount > 0;
  const badgeLabel = active ? `${activeCount}/${keys.length}` : t("librarySource.autoWatch.off");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={autoImportTrigger({ active })}
          aria-label={t("librarySource.autoWatch.configureAria")}
        >
          <span className={autoImportTriggerIcon()}>
            <DownloadCloud className="size-4" />
            <span className={autoImportTriggerCue()} aria-hidden>
              <RefreshCw className="size-2.5" />
            </span>
          </span>
          <span className={autoImportTriggerLabel()}>{t("librarySource.autoWatch.trigger")}</span>
          <span className={autoImportBadge({ active })}>{badgeLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className={autoImportPopover()}
        onEscapeKeyDown={(e) => e.stopPropagation()}
      >
        <div className={autoImportTitle()}>
          {t("librarySource.autoWatch.title")}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-fg/40 hover:text-fg/70 inline-flex items-center justify-center"
                aria-label={t("librarySource.autoWatch.howAria")}
              >
                <Info className="size-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              className="max-w-65 text-[11px] leading-relaxed"
              onEscapeKeyDown={(e) => e.stopPropagation()}
            >
              {t("librarySource.autoWatch.help", { provider: providerName })}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-1">
          {keys.map((key) => (
            <label key={key} className={autoImportRow()}>
              <span className={autoImportRowLabel()}>
                {t(WATCH_ROW_KEYS[key].label)}
                <span className={autoImportRowSub()}>{t(WATCH_ROW_KEYS[key].sub, { provider: providerName })}</span>
              </span>
              <Switch
                checked={value[key]}
                onCheckedChange={(v) => onChange({ [key]: Boolean(v) })}
                aria-label={t(WATCH_ROW_KEYS[key].aria)}
              />
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
