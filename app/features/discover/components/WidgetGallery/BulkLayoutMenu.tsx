"use client";

import { ChevronDown, Layers } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/Tooltip";

import { BULK_MENU_EDGE_PX } from "./constants";
import { LayoutMenuItems } from "./LayoutMenuItems";
import { bulkTrigger, layoutChevron } from "./styles";
import type { BulkLayoutMenuProps } from "./types";

export function BulkLayoutMenu({ addable, removable, onAdd, onRemove }: BulkLayoutMenuProps) {
  const { t } = useTranslation(["discover"]);
  const [open, setOpen] = useState(false);
  const idle = addable.length === 0 && removable.length === 0;

  return (
    <Tooltip>
      <DropdownMenu open={open && !idle} onOpenChange={(next) => setOpen(next && !idle)}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={bulkTrigger()}
              aria-label={t("board.gallery.bulk.label")}
              aria-disabled={idle}
            >
              <Layers />
              {t("board.gallery.all")}
              <ChevronDown className={layoutChevron()} aria-hidden />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent align="start" collisionPadding={BULK_MENU_EDGE_PX}>
          {addable.length > 0 ? (
            <DropdownMenuGroup aria-label={t("board.gallery.bulk.addTo")}>
              <DropdownMenuLabel>{t("board.gallery.bulk.addTo")}</DropdownMenuLabel>
              <LayoutMenuItems lists={addable} onPick={onAdd} />
            </DropdownMenuGroup>
          ) : null}
          {addable.length > 0 && removable.length > 0 ? <DropdownMenuSeparator /> : null}
          {removable.length > 0 ? (
            <DropdownMenuGroup aria-label={t("board.gallery.bulk.removeFrom")}>
              <DropdownMenuLabel>{t("board.gallery.bulk.removeFrom")}</DropdownMenuLabel>
              <LayoutMenuItems lists={removable} onPick={onRemove} />
            </DropdownMenuGroup>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {idle ? <TooltipContent>{t("board.gallery.bulk.nothing")}</TooltipContent> : null}
    </Tooltip>
  );
}
