"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { ChevronDown, ListPlus, Play, RadioTower, Shuffle } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  heroMenuItem,
  playSplit,
  playSplitHint,
  playSplitInk,
  playSplitLabel,
  playSplitMain,
  playSplitMore,
  playSplitOption,
} from "./styles";
import type { HeroPlaySplitProps } from "./types";

export function HeroPlaySplit({ mode, name, onPlay, onShuffle, onStartRadio, onEnqueue }: HeroPlaySplitProps) {
  const { t } = useTranslation("contentDetail");
  const [busy, setBusy] = useState(false);
  const hasMenu = Boolean(onShuffle ?? onStartRadio ?? onEnqueue);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      if (busy) return;
      setBusy(true);
      try {
        await action();
      } finally {
        setBusy(false);
      }
    },
    [busy]
  );

  return (
    <div className={playSplit({ mode })}>
      <button
        type="button"
        className={playSplitMain({ alone: !hasMenu })}
        onClick={() => run(onPlay)}
        disabled={busy}
        aria-label={t("playAll", { name })}
      >
        <span className={playSplitInk()}>
          <Play className="size-4 shrink-0 fill-current" aria-hidden />
          <span className={playSplitLabel()}>{t("play")}</span>
        </span>
      </button>
      {hasMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger className={playSplitMore()} disabled={busy} aria-label={t("moreListening", { name })}>
            <span className={playSplitInk()}>
              <ChevronDown className="size-4" aria-hidden />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {onShuffle ? (
              <DropdownMenuItem className={heroMenuItem()} onSelect={() => run(onShuffle)}>
                <Shuffle className="size-4" aria-hidden />
                {t("shuffle")}
              </DropdownMenuItem>
            ) : null}
            {onStartRadio ? (
              <DropdownMenuItem className={heroMenuItem()} onSelect={() => run(onStartRadio)}>
                <RadioTower className="size-4" aria-hidden />
                <span className={playSplitOption()}>
                  {t("startRadio")}
                  <span className={playSplitHint()}>{t("startRadioInfo")}</span>
                </span>
              </DropdownMenuItem>
            ) : null}
            {onEnqueue ? (
              <DropdownMenuItem className={heroMenuItem()} onSelect={() => run(onEnqueue)}>
                <ListPlus className="size-4" aria-hidden />
                {t("addToQueue")}
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
