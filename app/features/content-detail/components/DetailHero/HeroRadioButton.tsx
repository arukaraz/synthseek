"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { RadioTower } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { heroPlayButton } from "./styles";
import type { HeroRadioButtonProps } from "./types";

export function HeroRadioButton({ name, onStartRadio }: HeroRadioButtonProps) {
  const { t } = useTranslation("contentDetail");
  const [starting, setStarting] = useState(false);

  const handleClick = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    try {
      await onStartRadio();
    } finally {
      setStarting(false);
    }
  }, [onStartRadio, starting]);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={heroPlayButton()}
            onClick={handleClick}
            disabled={starting}
            aria-label={t("startRadioFrom", { name })}
          >
            <RadioTower className="size-4" />
            {t("startRadio")}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("startRadioInfo")}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
