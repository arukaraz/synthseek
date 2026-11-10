"use client";

import { Blocks, Check, Palette, Plus, SquareDashed } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { Button } from "@components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { resolveToastMobileOffset, resolveToastOffset } from "@components/ui/Toaster/helpers";
import { toastOffsetVars } from "@components/ui/Toaster/styles";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { useDockJobs } from "@hooks/api/subscriptions";
import { usePlayerBottomDock } from "@hooks/ui/player";

import { BOARD_SETTINGS_HREF } from "./constants";
import { CustomizeIcon } from "./CustomizeIcon";
import {
  boardDock,
  boardFab,
  boardFabLabel,
  boardMenu,
  boardMenuActions,
  boardMenuDivider,
  boardMenuDone,
  boardMenuRow,
  boardMenuToggle,
} from "./styles";
import type { BoardToolbarProps } from "./types";

export function BoardToolbar({ editing, onCustomize, onDone, onAddSpacer, onWidgets }: BoardToolbarProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const dockVisible = useDockJobs().length > 0;
  const playerDock = usePlayerBottomDock();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => setHost(document.body), []);

  if (!host) return null;

  return createPortal(
    <div
      data-board-dock
      className={boardDock({ editing })}
      style={toastOffsetVars(resolveToastMobileOffset(dockVisible), resolveToastOffset(dockVisible, playerDock))}
    >
      {editing ? (
        <div className={boardMenu()} role="toolbar" aria-label={t("board.customize")}>
          <div className={boardMenuRow()}>
            <FadeScroll axis="x">
              <div className={boardMenuActions()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={boardMenuToggle()}>
                      <Plus />
                      {t("board.add.action")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="center">
                    <DropdownMenuItem onSelect={onAddSpacer}>
                      <SquareDashed />
                      {t("board.spacer.name")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" onClick={onWidgets}>
                  <Blocks />
                  {t("widgets:board.widgetsDialog.action")}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={BOARD_SETTINGS_HREF}>
                    <Palette />
                    {t("widgets:board.appearance.title")}
                  </Link>
                </Button>
              </div>
            </FadeScroll>
            <span className={boardMenuDivider()} aria-hidden />
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" className={boardMenuDone()} aria-label={t("board.done")} onClick={onDone}>
                    <Check />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("board.done")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ) : (
        <button type="button" className={boardFab()} onClick={onCustomize} title={t("board.customize")}>
          <CustomizeIcon />
          <span className={boardFabLabel()}>{t("board.customize")}</span>
        </button>
      )}
    </div>,
    host
  );
}
