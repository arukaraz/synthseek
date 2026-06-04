"use client";

import { Switch } from "@components/ui/Switch";
import { useTranslation } from "react-i18next";

import { libraryTypeLowerLabelKey } from "../helpers";
import { cfgRow, cfgRowDesc, cfgRowLabel, detailSection, detailSectionTitle, detailSectionTitleLine } from "../styles";
import type { DetailSyncConfigProps } from "./types";

export function DetailSyncConfig({ itemType, syncEnabled, onToggle }: DetailSyncConfigProps) {
  const { t } = useTranslation("library");

  return (
    <div className={detailSection()}>
      <h3 className={detailSectionTitle()}>
        {t("spotifyLibrary.syncConfig.title")} <span className={detailSectionTitleLine()} />
      </h3>
      <div className={cfgRow()}>
        <div>
          <div className={cfgRowLabel()}>{t("spotifyLibrary.syncConfig.keepInSync")}</div>
          <div className={cfgRowDesc()}>
            {t("spotifyLibrary.syncConfig.keepInSyncDesc", { type: t(libraryTypeLowerLabelKey(itemType)) })}
          </div>
        </div>
        <Switch checked={syncEnabled} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}
