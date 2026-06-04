"use client";

import { useMemo, useState } from "react";
import { Copy, FileDown, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { useLogTail } from "@hooks/api/queries/useLogTail";
import { useLocalStorage } from "@hooks/ui/useLocalStorage";
import { cn } from "@utils/cn";
import { downloadText } from "@utils/download";

import { SegmentedControl } from "../../components/SegmentedControl";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import {
  DEFAULT_LINE_COUNT,
  DEFAULT_REFRESH_SECONDS,
  LINE_COUNT_OPTIONS,
  RECENT_EXPORT_FILENAME,
  REFRESH_STORAGE_KEY,
} from "./constants";
import { entriesToText, filterEntries, isRefreshOption } from "./helpers";
import { LogLineRow } from "./LogLineRow";
import {
  levelChips,
  logChip,
  logTerminal,
  searchWrap,
  toolbarActions,
  viewerToolbar,
  LOG_LEVEL_STYLES,
} from "./styles";

export function LogViewerCard() {
  const { t } = useTranslation("settings");
  const [lines, setLines] = useState(String(DEFAULT_LINE_COUNT));
  const [search, setSearch] = useState("");
  const [activeLevels, setActiveLevels] = useState<Set<string>>(() => new Set(Object.keys(LOG_LEVEL_STYLES)));
  const [refresh, setRefresh] = useLocalStorage(REFRESH_STORAGE_KEY, DEFAULT_REFRESH_SECONDS, isRefreshOption);

  const refreshMs = Number(refresh) > 0 ? Number(refresh) * 1000 : undefined;
  const { data, isLoading, error, refetch, isFetching } = useLogTail(Number(lines), refreshMs);

  const refreshOptions = [
    { value: "0", label: t("logs.viewer.refreshOptions.off") },
    { value: "5", label: t("logs.viewer.refreshOptions.seconds5") },
    { value: "10", label: t("logs.viewer.refreshOptions.seconds10") },
    { value: "30", label: t("logs.viewer.refreshOptions.seconds30") },
    { value: "60", label: t("logs.viewer.refreshOptions.seconds60") },
  ];

  const filtered = useMemo(
    () => (data ? filterEntries(data.entries, activeLevels, search) : []),
    [data, activeLevels, search]
  );

  const displayed = useMemo(() => [...filtered].reverse(), [filtered]);

  const toggleLevel = (level: string) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entriesToText(displayed));
      toast.success(t("logs.viewer.copied"));
    } catch {
      toast.error(t("logs.viewer.copyFailed"));
    }
  };

  const handleExportRecent = () => {
    if (!data) return;
    downloadText(RECENT_EXPORT_FILENAME, entriesToText(data.entries));
  };

  return (
    <SettingsCard title={t("logs.viewer.title")} description={t("logs.viewer.description")}>
      <div className={viewerToolbar()}>
        <div className={levelChips()}>
          {Object.entries(LOG_LEVEL_STYLES).map(([level, colorClass]) => (
            <button
              key={level}
              type="button"
              aria-pressed={activeLevels.has(level)}
              onClick={() => toggleLevel(level)}
              className={cn(logChip({ active: activeLevels.has(level) }), colorClass)}
            >
              {level}
            </button>
          ))}
        </div>
        <div className={searchWrap()}>
          <SettingsTextInput
            value={search}
            onChange={setSearch}
            placeholder={t("logs.viewer.searchPlaceholder")}
            ariaLabel={t("logs.viewer.searchAriaLabel")}
          />
        </div>
        <SegmentedControl
          value={lines}
          options={LINE_COUNT_OPTIONS}
          onChange={setLines}
          ariaLabel={t("logs.viewer.linesAriaLabel")}
        />
        <div className={toolbarActions()}>
          <SegmentedControl
            value={refresh}
            options={refreshOptions}
            onChange={setRefresh}
            ariaLabel={t("logs.viewer.refreshAriaLabel")}
          />
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? "animate-spin" : undefined} />
            {t("logs.viewer.refresh")}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={filtered.length === 0}>
            <Copy />
            {t("logs.viewer.copy")}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportRecent} disabled={!data || data.entries.length === 0}>
            <FileDown />
            {t("logs.viewer.exportRecent")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <span className="text-fg/60 text-sm">{t("logs.viewer.loading")}</span>
      ) : error ? (
        <span className="text-sm text-red-400">{t("logs.viewer.loadError", { message: error.message })}</span>
      ) : displayed.length === 0 ? (
        <span className="text-fg/50 text-sm">{t("logs.viewer.empty")}</span>
      ) : (
        <div className={logTerminal()}>
          {displayed.map((entry, index) => (
            <LogLineRow key={index} entry={entry} />
          ))}
        </div>
      )}
    </SettingsCard>
  );
}
