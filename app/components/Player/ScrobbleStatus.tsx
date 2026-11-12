"use client";

import { Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

import { scrobbleDot, scrobbleStatus } from "./styles";
import type { PlayerScrobbleProps } from "./types";

export function ScrobbleStatus({ state, actionable, lock, size, onToggle }: PlayerScrobbleProps) {
  const { t } = useTranslation("player");
  const label = lock === null ? t(`scrobble.${state}`) : t(`scrobble.locked.${lock}`);
  const icon = size === "stage" ? "size-4" : "size-3.5";

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
      </span>
    );
  }

  return (
    <button
      type="button"
      className={scrobbleStatus({ state, size })}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={state !== "off"}
      title={label}
    >
      <Radio className={icon} />
      <span className={scrobbleDot({ state })} />
    </button>
  );
}
