"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { Shuffle } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { heroIconButton } from "./styles";
import type { HeroShuffleButtonProps } from "./types";

export function HeroShuffleButton({ name, onShuffle }: HeroShuffleButtonProps) {
  const { t } = useTranslation("contentDetail");
  const [starting, setStarting] = useState(false);

  const handleClick = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    try {
      await onShuffle();
    } finally {
      setStarting(false);
    }
  }, [onShuffle, starting]);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={heroIconButton()}
            onClick={handleClick}
            disabled={starting}
            aria-label={t("shuffleAll", { name })}
          >
            <Shuffle className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("shuffleAll", { name })}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
