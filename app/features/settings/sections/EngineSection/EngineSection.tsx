"use client";

import { useSettings } from "@hooks/api/queries/useSettings";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot, emptyPanel, sectionGrid } from "../../styles";
import { ImportCard } from "./ImportCard";
import { PlexBehaviorCard } from "./PlexBehaviorCard";
import { QueueCard } from "./QueueCard";
import { SearchCard } from "./SearchCard";
import { SmartSearchCard } from "./SmartSearchCard";
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
      <div className={sectionGrid()}>
        <QueueCard initial={data.engine.queue} />
        <SearchCard initial={data.engine.search} />
        <TimeoutsCard initial={data.engine.timeouts} />
        <ImportCard initial={data.engine.import} />
        <PlexBehaviorCard initial={data.engine.plexBehavior} />
        <SmartSearchCard initial={data.engine.smartSearch} />
      </div>
    </div>
  );
}
