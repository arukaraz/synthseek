"use client";

import { Info, Play } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { cardCoverAction, cardCoverActions, cardCoverScrim } from "./styles";
import type { CardCoverActionsProps } from "./types";

export function CardCoverActions({ name, onPlay, onOpen }: CardCoverActionsProps) {
  const { t } = useTranslation(["library", "contentDetail"]);
  const [starting, setStarting] = useState(false);

  const handlePlay = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (starting) return;
      setStarting(true);
      try {
        await onPlay();
      } finally {
        setStarting(false);
      }
    },
    [onPlay, starting]
  );

  const handleOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onOpen();
    },
    [onOpen]
  );

  return (
    <div className={cardCoverActions()}>
      <span aria-hidden className={cardCoverScrim()} />
      <button
        type="button"
        className={cardCoverAction({ tone: "play" })}
        onClick={handlePlay}
        disabled={starting}
        aria-label={t("library:page.actions.playAll", { name })}
      >
        <Play className="size-5 fill-current" />
      </button>
      <button
        type="button"
        className={cardCoverAction()}
        onClick={handleOpen}
        aria-label={t("contentDetail:openDetail", { name })}
      >
        <Info className="size-5" />
      </button>
    </div>
  );
}
