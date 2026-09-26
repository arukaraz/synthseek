"use client";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  bbStat,
  bbStatStrong,
  bottombar,
  bottombarButtons,
  bottombarLeft,
  bottombarRight,
  downloadChoice,
} from "../styles";

import type { ModalBottombarProps } from "./types";

export function ModalBottombar({
  download,
  totalRows,
  totalTracks,
  onSave,
  onCancel,
  isSaving,
  hasChanges,
  onRefresh,
  isRefreshing,
}: ModalBottombarProps) {
  const { t } = useTranslation("library");

  return (
    <div className={bottombar()}>
      <div className={bottombarLeft()}>
        <span className={bbStat()}>
          <span className={bbStatStrong()}>{totalRows}</span> {t("librarySource.bottombar.rows", { count: totalRows })}
        </span>
        <span className={bbStat()}>
          <span className={bbStatStrong()}>{totalTracks}</span>{" "}
          {t("librarySource.bottombar.tracksTotal", { count: totalTracks })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          title={t("librarySource.bottombar.refreshTitle")}
          className="ml-auto sm:ml-0"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">
            {isRefreshing ? t("librarySource.bottombar.refreshing") : t("librarySource.bottombar.refreshList")}
          </span>
        </Button>
      </div>
      <div className={bottombarRight()}>
        {download === null ? null : (
          <label
            className={downloadChoice()}
            title={t("librarySource.bottombar.downloadMissingHint", { provider: download.providerName })}
          >
            <Switch
              checked={download.enabled}
              onCheckedChange={(checked) => download.onChange(Boolean(checked))}
              disabled={isSaving}
            />
            {t("librarySource.bottombar.downloadMissing")}
          </label>
        )}
        <div className={bottombarButtons()}>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving} className="flex-1 sm:flex-none">
            {t("librarySource.bottombar.cancel")}
          </Button>
          <Button onClick={onSave} disabled={!hasChanges || isSaving} size="sm" className="flex-1 sm:flex-none">
            {isSaving ? t("librarySource.bottombar.saving") : t("librarySource.bottombar.saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  );
}
