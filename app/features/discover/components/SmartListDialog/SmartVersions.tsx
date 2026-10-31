"use client";

import { Bookmark, Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useRestoreSetVersion, useSaveSetCopy } from "@hooks/api/mutations/widgets/useSetListActions";

import { dateText } from "./helpers";
import { empty, row, rowCopy, rowSub, rowTitle } from "./styles";
import type { SmartVersionsProps } from "./types";

export function SmartVersions({ widgetId, detail }: SmartVersionsProps) {
  const { t } = useTranslation("discover");
  const restore = useRestoreSetVersion();
  const saveCopy = useSaveSetCopy();
  const { slotId } = detail;

  if (detail.versions.length === 0) return <p className={empty()}>{t("smartList.noVersions")}</p>;

  return (
    <>
      {detail.versions.map(({ version, at, tracks }) => (
        <div key={version} className={row()}>
          <span className={rowCopy()}>
            <span className={rowTitle()}>{t("smartList.version", { version })}</span>
            <span className={rowSub()}>{t("smartList.versionMeta", { date: dateText(at), count: tracks })}</span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={restore.isPending}
            onClick={() => restore.mutate({ widgetId, slotId, version })}
          >
            <Undo2 />
            {t("smartList.restore")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={saveCopy.isPending}
            onClick={() => saveCopy.mutate({ widgetId, slotId, version })}
          >
            <Bookmark />
            {t("smartList.save")}
          </Button>
        </div>
      ))}
    </>
  );
}
