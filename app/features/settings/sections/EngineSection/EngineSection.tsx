"use client";

import { useSettings } from "@hooks/api/queries/useSettings";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot, emptyPanel, sectionGrid } from "../../styles";
import { EngineIntro } from "./EngineIntro";
import { ImportCard } from "./ImportCard";
import { QueueCard } from "./QueueCard";
import { SearchCard } from "./SearchCard";
import { TimeoutsCard } from "./TimeoutsCard";

export function EngineSection() {
  const { data, isLoading, error } = useSettings();

  if (isLoading) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title="Engine" />
        <div className={emptyPanel()}>
          <span className="text-fg/60 text-sm">Loading settings…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title="Engine" />
        <div className={emptyPanel()}>
          <span className="text-sm text-red-400">Failed to load settings: {error?.message ?? "Unknown error"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="Engine" />
      <EngineIntro />
      <div className={sectionGrid()}>
        <SearchCard initial={{ search: data.engine.search, smartSearch: data.engine.smartSearch }} />
        <TimeoutsCard initial={data.engine.timeouts} />
        <QueueCard initial={data.engine.queue} />
        <ImportCard initial={data.engine.import} />
      </div>
    </div>
  );
}
