"use client";

import { playerActions, useQueuePresence } from "@hooks/ui/player";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { CircleMinus, CirclePlus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { trackFileTarget } from "../../../helpers";
import type { LibraryMenuAction } from "../../../types";
import { LibraryActionMenu } from "../../LibraryActionMenu";
import { fileMenuActions } from "../../LibraryFileFlow";
import { actionsCell, rowKebab } from "../styles";
import { canSearchBetterQuality, trackQueueAction } from "./helpers";
import type { TrackActionsCellProps } from "./types";

export function TrackActionsCell({ item, onEnqueue, onSearchBetterQuality, fileActions }: TrackActionsCellProps) {
  const { t } = useTranslation("library");
  const { isAdmin } = useAuthContext();
  const presenceOf = useQueuePresence();
  const queueAction = trackQueueAction(item.playable, presenceOf(item.id));

  const actions: LibraryMenuAction[] = [
    {
      key: "upgrade",
      icon: Sparkles,
      label: t("page.actions.searchBetterQuality"),
      onSelect: () => onSearchBetterQuality([item.id]),
      disabled: !canSearchBetterQuality(item),
    },
    ...(queueAction === "add"
      ? [
          {
            key: "queue",
            icon: CirclePlus,
            label: t("page.actions.addToQueue"),
            onSelect: () => void onEnqueue([item.id]),
          },
        ]
      : []),
    ...(queueAction === "remove"
      ? [
          {
            key: "unqueue",
            icon: CircleMinus,
            label: t("page.actions.removeFromQueue"),
            onSelect: () => playerActions.removeTrackFromQueue(item.id),
          },
        ]
      : []),
    ...fileMenuActions(trackFileTarget(item), fileActions, isAdmin),
  ];

  return (
    <div className={actionsCell()}>
      <LibraryActionMenu
        title={item.title}
        subtitle={item.artist}
        triggerLabel={t("page.actions.trackMenu", { title: item.title })}
        triggerClassName={rowKebab()}
        actions={actions}
      />
    </div>
  );
}
