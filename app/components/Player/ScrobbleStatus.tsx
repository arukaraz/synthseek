"use client";

import { Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SCROBBLE_SIGNS } from "./constants";
import { labelled } from "./helpers";
import { scrobbleDot, scrobbleSign, scrobbleStatus } from "./styles";
import type { PlayerScrobbleProps } from "./types";

export function ScrobbleStatus({ state, actionable, lock, size, onToggle }: PlayerScrobbleProps) {
  const { t } = useTranslation("player");
  const label = lock === null ? t(`scrobble.${state}`) : t(`scrobble.locked.${lock}`);
  const icon = size === "stage" ? "size-4" : "size-3.5";
  const Sign = SCROBBLE_SIGNS[state];

  if (!actionable) {
    return (
      <span
        className={scrobbleStatus({ state, size, locked: lock !== null })}
        role="status"
        aria-label={label}
        data-locked={lock !== null}
        title={label}
      >
        <Radio className={icon} />
        <span className={scrobbleDot({ state })} />
        <Sign aria-hidden className={scrobbleSign()} />
      </span>
    );
  }

  return (
    <button
      type="button"
      className={scrobbleStatus({ state, size })}
      onClick={onToggle}
      {...labelled(label)}
      aria-pressed={state !== "off"}
    >
      <Radio className={icon} />
      <span className={scrobbleDot({ state })} />
      <Sign aria-hidden className={scrobbleSign()} />
    </button>
  );
}
