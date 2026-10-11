"use client";

import { cn } from "@utils/cn";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { labelled } from "./helpers";
import { iconButton } from "./styles";
import type { PlayerTrackButtonProps } from "./types";

export function UpgradeButton({ view, actions, size, className }: PlayerTrackButtonProps) {
  const { t } = useTranslation("player");

  return (
    <button
      type="button"
      className={cn(iconButton({ size }), className)}
      onClick={actions.searchBetterQuality}
      disabled={view.upgrading}
      {...labelled(t("controls.upgrade"))}
    >
      <Sparkles className={size === "stage" ? "size-4" : "@player:size-4 size-5"} />
    </button>
  );
}
