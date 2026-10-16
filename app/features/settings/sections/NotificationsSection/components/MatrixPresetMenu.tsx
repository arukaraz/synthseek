"use client";

import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";

import { NOTIFICATION_PRESET_IDS } from "../constants";
import { presetKinds } from "../helpers";
import { matrixPresetTrigger } from "../styles";
import type { MatrixPresetMenuProps } from "../types";

export function MatrixPresetMenu({
  channel,
  selectedCount,
  others,
  available,
  kindsOf,
  onApply,
}: MatrixPresetMenuProps) {
  const { t } = useTranslation("settings");
  const channelName = t(`notifications.channels.${channel}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={matrixPresetTrigger()}
          aria-label={t("notifications.matrix.presetsFor", { channel: channelName })}
        >
          {t("notifications.matrix.selected", { count: selectedCount })}
          <ChevronDown className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>{t("notifications.matrix.startFrom")}</DropdownMenuLabel>
        {NOTIFICATION_PRESET_IDS.map((preset) => (
          <DropdownMenuItem key={preset} onSelect={() => onApply(presetKinds(preset, available))}>
            {t(`notifications.matrix.presets.${preset}`)}
          </DropdownMenuItem>
        ))}
        {others.map((other) => (
          <DropdownMenuItem key={other} onSelect={() => onApply([...kindsOf(other)])}>
            {t("notifications.matrix.sameAs", { channel: t(`notifications.channels.${other}`) })}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onApply([])}>{t("notifications.matrix.presets.nothing")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
