"use client";

import { Bookmark, Pin, Play, RefreshCw, Shuffle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { DialogTitle } from "@components/ui/Dialog";
import { usePinSetList, useRebuildSet, useSaveSetCopy } from "@hooks/api/mutations/widgets/useSetListActions";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { dateText } from "./helpers";
import { actions, head, sub, title } from "./styles";
import type { SmartListHeaderProps } from "./types";

export function SmartListHeader({ widgetId, detail }: SmartListHeaderProps) {
  const { t } = useTranslation("discover");
  const { playEntity, shuffleEntity } = useEntityPlayback();
  const pin = usePinSetList();
  const saveCopy = useSaveSetCopy();
  const rebuild = useRebuildSet();
  const { slotId, pinned } = detail;
  const target = { kind: "tracks" as const, trackIds: detail.tracks.map((track) => track.id) };

  return (
    <div className={head()}>
      <DialogTitle className={title()}>{detail.name}</DialogTitle>
      <p className={sub()}>
        {t("smartList.status", {
          version: detail.version,
          updated: dateText(detail.updatedAt),
          next: pinned ? t("smartList.pinnedSkip") : t("smartList.next", { date: dateText(detail.nextAt) }),
        })}
      </p>
      <div className={actions()}>
        <Button size="sm" onClick={() => void playEntity(target)}>
          <Play />
          {t("smartList.play")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void shuffleEntity(target)}>
          <Shuffle />
          {t("smartList.shuffle")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          aria-pressed={pinned}
          disabled={pin.isPending}
          onClick={() => pin.mutate({ widgetId, slotId, pinned: !pinned })}
        >
          <Pin />
          {t(pinned ? "smartList.pinned" : "smartList.pin")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={saveCopy.isPending}
          onClick={() => saveCopy.mutate({ widgetId, slotId, version: null })}
        >
          <Bookmark />
          {t("smartList.saveVersion")}
        </Button>
        <Button variant="ghost" size="sm" disabled={rebuild.isPending} onClick={() => rebuild.mutate({ id: widgetId })}>
          <RefreshCw />
          {t("smartList.rebuild")}
        </Button>
      </div>
    </div>
  );
}
