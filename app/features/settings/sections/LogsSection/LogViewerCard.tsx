"use client";

import { useMemo, useState } from "react";
import { Copy, FileDown, RefreshCw } from "lucide-react";
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
  REFRESH_INTERVAL_OPTIONS,
  REFRESH_STORAGE_KEY,
  SEARCH_PLACEHOLDER,
  VIEWER_CARD_DESCRIPTION,
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
  const [lines, setLines] = useState(String(DEFAULT_LINE_COUNT));
  const [search, setSearch] = useState("");
  const [activeLevels, setActiveLevels] = useState<Set<string>>(() => new Set(Object.keys(LOG_LEVEL_STYLES)));
  const [refresh, setRefresh] = useLocalStorage(REFRESH_STORAGE_KEY, DEFAULT_REFRESH_SECONDS, isRefreshOption);

  const refreshMs = Number(refresh) > 0 ? Number(refresh) * 1000 : undefined;
  const { data, isLoading, error, refetch, isFetching } = useLogTail(Number(lines), refreshMs);

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
      toast.success("Logs copied to clipboard");
    } catch {
      toast.error("Failed to copy logs");
    }
  };

  const handleExportRecent = () => {
    if (!data) return;
    downloadText(RECENT_EXPORT_FILENAME, entriesToText(data.entries));
  };

  return (
    <SettingsCard title="Logs" description={VIEWER_CARD_DESCRIPTION}>
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
            placeholder={SEARCH_PLACEHOLDER}
            ariaLabel="Search logs"
          />
        </div>
        <SegmentedControl value={lines} options={LINE_COUNT_OPTIONS} onChange={setLines} ariaLabel="Lines to load" />
        <div className={toolbarActions()}>
          <SegmentedControl
            value={refresh}
            options={REFRESH_INTERVAL_OPTIONS}
            onChange={setRefresh}
            ariaLabel="Auto-refresh interval"
          />
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? "animate-spin" : undefined} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={filtered.length === 0}>
            <Copy />
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportRecent} disabled={!data || data.entries.length === 0}>
            <FileDown />
            Export recent
          </Button>
        </div>
      </div>

      {isLoading ? (
        <span className="text-fg/60 text-sm">Loading logs…</span>
      ) : error ? (
        <span className="text-sm text-red-400">Failed to load logs: {error.message}</span>
      ) : displayed.length === 0 ? (
        <span className="text-fg/50 text-sm">No log lines to show.</span>
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
