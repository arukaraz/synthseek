"use client";

import { Pause, Play, Repeat, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import { COPY_COMPARISON } from "@hooks/ui/copyComparison";

import { dupClock, dupClockNow, dupOption, dupPlayButton, dupTransport } from "../../styles";
import { clockLabel } from "./helpers";
import type { ComparatorTransportProps } from "./types";

export function ComparatorTransport({ comparison }: ComparatorTransportProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={dupTransport()}>
      <Button
        size="icon"
        className={dupPlayButton()}
        aria-label={comparison.playing ? t("libraryScan.duplicates.pause") : t("libraryScan.duplicates.play")}
        onClick={comparison.toggle}
      >
        {comparison.playing ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
      </Button>
      <span className={dupClock()}>
        <span className={dupClockNow()}>{clockLabel(comparison.position)}</span> / {clockLabel(comparison.bounds.end)}
      </span>
      <label className={dupOption()}>
        <Switch checked={comparison.aligned} onCheckedChange={comparison.setAligned} />
        {t("libraryScan.duplicates.align")}
      </label>
      <label className={dupOption()}>
        <Switch checked={comparison.matched} onCheckedChange={comparison.setMatched} />
        {t("libraryScan.duplicates.matchLoudness")}
      </label>
      <span className="flex-1" />
      {comparison.loop === null ? (
        <Button size="sm" variant="ghost" onClick={comparison.toggleLoop} aria-pressed={false}>
          <Repeat />
          {t("libraryScan.duplicates.loop", { seconds: COPY_COMPARISON.LOOP_SECONDS })}
        </Button>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          onClick={comparison.toggleLoop}
          aria-pressed
          title={t("libraryScan.duplicates.loopOff")}
        >
          <Repeat />
          {t("libraryScan.duplicates.loopRange", {
            from: clockLabel(comparison.loop.start),
            to: clockLabel(comparison.loop.end),
          })}
          <X />
        </Button>
      )}
    </div>
  );
}
