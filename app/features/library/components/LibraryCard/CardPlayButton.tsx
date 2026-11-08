"use client";

import { Play, Shuffle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cardPlayButton } from "./styles";
import type { CardPlayButtonProps } from "./types";

export function CardPlayButton({ name, order, onPlay, placement }: CardPlayButtonProps) {
  const { t } = useTranslation(["library", "contentDetail"]);
  const [starting, setStarting] = useState(false);

  return (
    <button
      type="button"
      className={cardPlayButton({ placement })}
      disabled={starting}
      onKeyDown={(event) => event.stopPropagation()}
      onClick={async (event) => {
        event.stopPropagation();
        if (starting) return;
        setStarting(true);
        try {
          await onPlay();
        } finally {
          setStarting(false);
        }
      }}
      aria-label={
        order === "shuffled" ? t("contentDetail:shuffleAll", { name }) : t("library:page.actions.playAll", { name })
      }
    >
      {order === "shuffled" ? <Shuffle className="size-4" /> : <Play className="size-4 fill-current" />}
    </button>
  );
}
