"use client";

import { Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

import { scrobbleDot, scrobbleStatus } from "./styles";
import type { PlayerScrobbleProps } from "./types";

export function ScrobbleStatus({ state, actionable, size, onToggle }: PlayerScrobbleProps) {
  const { t } = useTranslation("player");
  const label = t(`scrobble.${state}`);
  const icon = size === "stage" ? "size-4" : "size-3.5";

  if (!actionable) {
    return (
      <span className={scrobbleStatus({ state, size })} role="status" aria-label={label} title={label}>
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
