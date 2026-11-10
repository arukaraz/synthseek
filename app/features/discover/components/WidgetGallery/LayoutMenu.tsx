"use client";

import { ChevronDown, Layers, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";

import { BOARD_LIST_ICONS, BOARD_LIST_KEYS } from "../ExploreBoard/constants";
import { cardAction, layoutChevron } from "./styles";
import type { LayoutMenuProps } from "./types";

export function LayoutMenu({ lists, tone, label, ariaLabel, onPick }: LayoutMenuProps) {
  const { t } = useTranslation(["widgets"]);
  const Icon = tone === "add" ? Plus : X;
  const variant = tone === "add" ? "default" : "ghost";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant={variant} className={cardAction()} aria-label={ariaLabel}>
          <Icon />
          {label}
          <ChevronDown className={layoutChevron()} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {lists.map((list) => {
          const ListIcon = BOARD_LIST_ICONS[list];
          return (
            <DropdownMenuItem key={list} onSelect={() => onPick([list])}>
              <ListIcon />
              {t(BOARD_LIST_KEYS[list])}
            </DropdownMenuItem>
          );
        })}
        {lists.length > 1 ? (
          <DropdownMenuItem onSelect={() => onPick(lists)}>
            <Layers />
            {t("board.layouts.both")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
