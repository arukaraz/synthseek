"use client";

import { Switch } from "@components/ui/Switch";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { libraryTypeLowerLabelKey } from "../helpers";
import { cfgRow, cfgRowDesc, cfgRowLabel, detailSection, detailSectionTitle, detailSectionTitleLine } from "../styles";
import type { DetailSyncConfigProps } from "./types";

export function DetailSyncConfig({ itemType, syncEnabled, onToggle }: DetailSyncConfigProps) {
  const { t } = useTranslation("library");
  const labelId = useId();

  return (
    <div className={detailSection()}>
      <h3 className={detailSectionTitle()}>
        {t("librarySource.syncConfig.title")} <span className={detailSectionTitleLine()} />
      </h3>
      <div className={cfgRow()}>
        <div>
          <div id={labelId} className={cfgRowLabel()}>
            {t("librarySource.syncConfig.keepInSync")}
          </div>
          <div className={cfgRowDesc()}>
            {t("librarySource.syncConfig.keepInSyncDesc", { type: t(libraryTypeLowerLabelKey(itemType)) })}
          </div>
        </div>
        <Switch checked={syncEnabled} onCheckedChange={onToggle} aria-labelledby={labelId} />
      </div>
    </div>
  );
}
