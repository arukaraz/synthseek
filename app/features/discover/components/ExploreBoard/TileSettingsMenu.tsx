"use client";

import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpToLine,
  FoldVertical,
  PaintBucket,
  Settings,
  UnfoldVertical,
} from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";

import { SPACER_MAX_ROWS, SPACER_MIN_ROWS } from "./constants";
import { tileHasBackground } from "./helpers";
import { controlButton } from "./styles";
import type { TileSettingsMenuProps } from "./types";

export function TileSettingsMenu({
  item,
  device,
  name,
  position,
  total,
  dense,
  actions,
  opener,
}: TileSettingsMenuProps) {
  const { t } = useTranslation("discover");
  const openedDialog = useRef(false);
  const EarlierIcon = device === "wide" ? ArrowLeft : ArrowUp;
  const LaterIcon = device === "wide" ? ArrowRight : ArrowDown;
  const keepOpen = (event: Event, change: () => void) => {
    event.preventDefault();
    change();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={controlButton({ dense })} aria-label={t("board.tile.settings", { name })}>
          <Settings />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(event) => {
          if (openedDialog.current) event.preventDefault();
          openedDialog.current = false;
        }}
      >
        <DropdownMenuItem disabled={position <= 1} onSelect={() => actions.move(item.id, -1)}>
          <EarlierIcon />
          {t("board.tile.moveEarlier")}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={position >= total} onSelect={() => actions.move(item.id, 1)}>
          <LaterIcon />
          {t("board.tile.moveLater")}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={position <= 1} onSelect={() => actions.moveToEdge(item.id, "top")}>
          <ArrowUpToLine />
          {t("board.tile.moveTop")}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={position >= total} onSelect={() => actions.moveToEdge(item.id, "bottom")}>
          <ArrowDownToLine />
          {t("board.tile.moveBottom")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(event) => keepOpen(event, () => actions.toggleBackground(item.id))}>
          <PaintBucket />
          {tileHasBackground(item) ? t("board.tile.backgroundOff") : t("board.tile.backgroundOn")}
        </DropdownMenuItem>
        {item.kind === "spacer" ? (
          <>
            <DropdownMenuItem
              disabled={item.rows <= SPACER_MIN_ROWS}
              onSelect={(event) => keepOpen(event, () => actions.resizeSpacer(item.id, -1))}
            >
              <FoldVertical />
              {t("board.spacer.shorter")}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={item.rows >= SPACER_MAX_ROWS}
              onSelect={(event) => keepOpen(event, () => actions.resizeSpacer(item.id, 1))}
            >
              <UnfoldVertical />
              {t("board.spacer.taller")}
            </DropdownMenuItem>
          </>
        ) : null}
        {opener ? (
          <DropdownMenuItem
            onSelect={() => {
              openedDialog.current = true;
              opener.onSelect();
            }}
          >
            <opener.icon />
            {opener.label}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
