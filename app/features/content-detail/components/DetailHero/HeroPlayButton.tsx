"use client";

import { Play } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { heroPlayButton } from "./styles";
import type { HeroPlayButtonProps } from "./types";

export function HeroPlayButton({ name, onPlay }: HeroPlayButtonProps) {
  const { t } = useTranslation("contentDetail");
  const [starting, setStarting] = useState(false);

  const handleClick = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    try {
      await onPlay();
    } finally {
      setStarting(false);
    }
  }, [onPlay, starting]);

  return (
    <button
      type="button"
      className={heroPlayButton()}
      onClick={handleClick}
      disabled={starting}
      aria-label={t("playAll", { name })}
    >
      <Play className="size-4 fill-current" />
      {t("play")}
    </button>
  );
}
