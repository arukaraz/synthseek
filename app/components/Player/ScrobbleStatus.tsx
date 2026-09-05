"use client";

import { Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

import { scrobbleDot, scrobbleStatus } from "./styles";
import type { PlayerScrobbleProps } from "./types";

export function ScrobbleStatus({ state, size }: PlayerScrobbleProps) {
  const { t } = useTranslation("player");
  const label = t(`scrobble.${state}`);

  return (
    <span className={scrobbleStatus({ state, size })} role="status" aria-label={label} title={label}>
      <Radio className={size === "stage" ? "size-4" : "size-3.5"} />
      <span className={scrobbleDot({ state })} />
    </span>
  );
}
