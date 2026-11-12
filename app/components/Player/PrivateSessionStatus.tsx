"use client";

import { EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { labelled } from "./helpers";
import { privateSessionStatus } from "./styles";
import type { PrivateSessionStatusProps } from "./types";

export function PrivateSessionStatus({ active, size, onEnd }: PrivateSessionStatusProps) {
  const { t } = useTranslation("player");

  if (!active) return null;

  return (
    <button
      type="button"
      className={privateSessionStatus({ size })}
      onClick={onEnd}
      {...labelled(t("privateSession.end"))}
      data-testid="player-private-session"
    >
      <EyeOff className={size === "stage" ? "size-4" : "size-3.5"} />
    </button>
  );
}
