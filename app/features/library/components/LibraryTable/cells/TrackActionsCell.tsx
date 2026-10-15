"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { playerActions, useQueuePresence } from "@hooks/ui/player";
import { CircleMinus, CirclePlus, MoreVertical, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { trackFileTarget } from "../../../helpers";
import { libraryMenuItem } from "../../../styles";
import { FileActionMenuItems } from "../../LibraryFileFlow";
import { actionsCell, rowKebab } from "../styles";
import { canSearchBetterQuality, trackQueueAction } from "./helpers";
import type { TrackActionsCellProps } from "./types";

export function TrackActionsCell({ item, onEnqueue, onSearchBetterQuality, fileActions }: TrackActionsCellProps) {
  const { t } = useTranslation("library");
  const presenceOf = useQueuePresence();
  const queueAction = trackQueueAction(item.playable, presenceOf(item.id));

  return (
    <div className={actionsCell()}>
      <DropdownMenu>
        <DropdownMenuTrigger className={rowKebab()} aria-label={t("page.actions.trackMenu", { title: item.title })}>
          <MoreVertical className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className={libraryMenuItem()}
            disabled={!canSearchBetterQuality(item)}
            onSelect={() => onSearchBetterQuality([item.id])}
          >
            <Sparkles className="size-4" aria-hidden />
            {t("page.actions.searchBetterQuality")}
          </DropdownMenuItem>
          {queueAction === "add" ? (
            <DropdownMenuItem className={libraryMenuItem()} onSelect={() => void onEnqueue([item.id])}>
              <CirclePlus className="size-4" aria-hidden />
              {t("page.actions.addToQueue")}
            </DropdownMenuItem>
          ) : null}
          {queueAction === "remove" ? (
            <DropdownMenuItem
              className={libraryMenuItem()}
              onSelect={() => playerActions.removeTrackFromQueue(item.id)}
            >
              <CircleMinus className="size-4" aria-hidden />
              {t("page.actions.removeFromQueue")}
            </DropdownMenuItem>
          ) : null}
          <FileActionMenuItems target={trackFileTarget(item)} actions={fileActions} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
