"use client";

import { Play, Shuffle } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { cardCoverAction, cardCoverActions, cardCoverScrim } from "./styles";
import type { CardCoverActionsProps } from "./types";

export function CardCoverActions({ name, order, onPlay, menu }: CardCoverActionsProps) {
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

  return (
    <div className={cardCoverActions()} onKeyDown={(event) => event.stopPropagation()}>
      <span aria-hidden className={cardCoverScrim()} />
      <button
        type="button"
        className={cardCoverAction({ tone: "play" })}
        onClick={handlePlay}
        disabled={starting}
        aria-label={
          order === "shuffled" ? t("contentDetail:shuffleAll", { name }) : t("library:page.actions.playAll", { name })
        }
      >
        {order === "shuffled" ? <Shuffle className="size-5" /> : <Play className="size-5 fill-current" />}
      </button>
      {menu}
    </div>
  );
}
