"use client";

import { Button } from "@components/ui/Button";
import { ModalActionBar, ModalChoice } from "@components/ui/ModalActionBar";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { bbStat, bbStatStrong } from "../styles";

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
    <ModalActionBar
      start={
        <>
          <span className={bbStat()}>
            <span className={bbStatStrong()}>{totalRows}</span>{" "}
            {t("librarySource.bottombar.rows", { count: totalRows })}
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
        </>
      }
      choice={
        download === null ? undefined : (
          <ModalChoice
            label={t("librarySource.bottombar.downloadMissing")}
            hint={t("librarySource.bottombar.downloadMissingHint", { provider: download.providerName })}
            checked={download.enabled}
            onChange={download.onChange}
            disabled={isSaving}
          />
        )
      }
      cancel={{ label: t("librarySource.bottombar.cancel"), onClick: onCancel, disabled: isSaving }}
      save={{
        label: isSaving ? t("librarySource.bottombar.saving") : t("librarySource.bottombar.saveChanges"),
        onClick: onSave,
        disabled: !hasChanges || isSaving,
      }}
    />
  );
}
