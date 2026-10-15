"use client";

import { Lock, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ProgressBar } from "@components/ui/ProgressBar";
import { Switch } from "@components/ui/Switch";
import { useSetLibraryPathEnabled } from "@hooks/api/mutations/library/useLibraryPaths";
import { formatBytes } from "@utils/formatters";

import { pill } from "../../styles";
import { pathStatusLabel, pathTone, usedPercent } from "./helpers";
import { OrganiseProgress } from "./OrganiseProgress";
import {
  accessBadge,
  listRow,
  listRowGrid,
  rowActions,
  rowFolder,
  rowIdentity,
  rowStat,
  rowStatMain,
  rowStatSub,
  rowTitle,
  rowTitleLine,
} from "./styles";
import type { LibraryPathRowProps } from "./types";

export function LibraryPathRow({ path, organise, onEdit }: LibraryPathRowProps) {
  const { t } = useTranslation("settings");
  const setEnabled = useSetLibraryPathEnabled();
  const used = usedPercent(path);
  const ownsOrganise = organise !== undefined && organise.pathId === path.id;

  return (
    <li className={listRow()} aria-label={path.label}>
      <div className={listRowGrid({ layout: "paths" })}>
        <div className={rowIdentity()}>
          <div className={rowTitleLine()}>
            <span className={rowTitle()}>{path.label}</span>
            {path.isDefault ? <span className={pill({ tone: "info" })}>{t("libraryPaths.defaultBadge")}</span> : null}
            {path.fromEnvironment ? (
              <span className={pill({ tone: "muted" })} title={t("libraryPaths.environmentHint")}>
                <Lock className="mr-1 size-3" aria-hidden />
                {t("libraryPaths.environmentBadge")}
              </span>
            ) : null}
          </div>
          <span className={rowFolder()} title={path.folder}>
            {path.folder}
          </span>
          <span className={accessBadge({ tone: pathTone(path) })}>{pathStatusLabel(path)}</span>
        </div>

        <div className={rowStat()}>
          <span className={rowStatMain()}>
            {t("libraryPaths.files", { count: path.files, formatted: path.files.toLocaleString() })}
          </span>
          <span className={rowStatSub()}>{formatBytes(path.sizeBytes)}</span>
        </div>

        <div className={rowStat()}>
          <span className={rowStatMain()}>
            {path.freeBytes === null
              ? t("libraryPaths.freeUnknown")
              : t("libraryPaths.freeSpace", { size: formatBytes(path.freeBytes) })}
          </span>
          {used === null ? null : <ProgressBar progress={used} size="sm" />}
        </div>

        <div className={rowStat()}>
          <span className={rowStatMain()}>{t("libraryPaths.rulesCount", { count: path.ruleIds.length })}</span>
        </div>

        <div className={rowActions()}>
          <Switch
            checked={path.enabled}
            disabled={path.isDefault}
            onCheckedChange={(enabled) => setEnabled.mutate({ id: path.id, enabled })}
            aria-label={t("libraryPaths.enabledLabel", { label: path.label })}
            title={path.isDefault ? t("libraryPaths.defaultCannotTurnOff") : undefined}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
            aria-label={t("libraryPaths.editLabel", { label: path.label })}
          >
            <Pencil className="size-4" aria-hidden />
            {t("libraryPaths.edit")}
          </Button>
        </div>
      </div>

      {ownsOrganise ? <OrganiseProgress status={organise} /> : null}
    </li>
  );
}
