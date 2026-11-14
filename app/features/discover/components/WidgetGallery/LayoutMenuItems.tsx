"use client";

import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DropdownMenuItem } from "@components/ui/DropdownMenu";

import { BOARD_LIST_ICONS, BOARD_LIST_KEYS } from "../ExploreBoard/constants";
import type { LayoutMenuItemsProps } from "./types";

export function LayoutMenuItems({ lists, onPick }: LayoutMenuItemsProps) {
  const { t } = useTranslation(["widgets"]);

  return (
    <>
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
    </>
  );
}
