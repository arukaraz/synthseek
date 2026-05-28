"use client";

import { Switch } from "@components/ui/Switch";

import { libraryTypeLowerLabel } from "../helpers";
import { cfgRow, cfgRowDesc, cfgRowLabel, detailSection, detailSectionTitle, detailSectionTitleLine } from "../styles";
import type { DetailSyncConfigProps } from "./types";

export function DetailSyncConfig({ itemType, syncEnabled, onToggle }: DetailSyncConfigProps) {
  return (
    <div className={detailSection()}>
      <h3 className={detailSectionTitle()}>
        Sync configuration <span className={detailSectionTitleLine()} />
      </h3>
      <div className={cfgRow()}>
        <div>
          <div className={cfgRowLabel()}>Keep in sync</div>
          <div className={cfgRowDesc()}>
            Mirror this {libraryTypeLowerLabel(itemType)}&apos;s tracklist into Synthseek when it changes
          </div>
        </div>
        <Switch checked={syncEnabled} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}
