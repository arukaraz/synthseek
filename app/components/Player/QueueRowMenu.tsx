"use client";

import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";

import { QUEUE_MOVE_ICONS } from "./constants";
import { labelledOnHover } from "./helpers";
import { queueMoveTargetsFor } from "./queueMove";
import { iconButton } from "./styles";
import type { QueueRowMenuProps } from "./types";

export function QueueRowMenu({ title, place, onMove }: QueueRowMenuProps) {
  const { t } = useTranslation("player");
  const targets = queueMoveTargetsFor(place.position - 1, place.total);
  if (targets.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={iconButton({ size: "inline" })}
          {...labelledOnHover(t("queueMove.menu", { title }))}
        >
          <ArrowUpDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {targets.map((target) => {
          const Icon = QUEUE_MOVE_ICONS[target];
          return (
            <DropdownMenuItem key={target} onSelect={() => onMove(target)}>
              <Icon />
              {t(`queueMove.${target}`)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
