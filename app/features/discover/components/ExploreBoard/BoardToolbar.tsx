"use client";

import { Blocks, Check, LayoutGrid, LayoutTemplate, Palette, Plus, SquareDashed } from "lucide-react";
import { AnimatePresence } from "framer-motion";
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
import { isTextEntryTarget } from "@utils/text-entry";

import { AppearanceTray } from "../BoardSettings/AppearanceTray";
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

export function BoardToolbar({
  editing,
  onCustomize,
  onDone,
  onManageWidgets,
  onAddSpacer,
  onArrange,
  onTemplates,
  background,
  onBackground,
}: BoardToolbarProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const dockVisible = useDockJobs().length > 0;
  const playerDock = usePlayerBottomDock();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);

  useEffect(() => setHost(document.body), []);

  useEffect(() => {
    if (!trayOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || isTextEntryTarget(event.target)) return;
      event.preventDefault();
      setTrayOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [trayOpen]);

  if (!host) return null;

  const closingTray = (action: () => void) => () => {
    setTrayOpen(false);
    action();
  };

  return createPortal(
    <div
      data-board-dock
      className={boardDock({ editing })}
      style={toastOffsetVars(
        resolveToastMobileOffset(dockVisible, playerDock),
        resolveToastOffset(dockVisible, playerDock)
      )}
    >
      {editing ? (
        <div className={boardMenu()} role="toolbar" aria-label={t("board.customize")}>
          <AnimatePresence initial={false}>
            {trayOpen ? <AppearanceTray key="appearance" background={background} onBackground={onBackground} /> : null}
          </AnimatePresence>
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
                <Button variant="ghost" size="sm" onClick={closingTray(onManageWidgets)}>
                  <Blocks />
                  {t("board.manageWidgets")}
                </Button>
                <Button variant="ghost" size="sm" onClick={closingTray(onArrange)}>
                  <LayoutGrid />
                  {t("board.arrange.action")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={boardMenuToggle()}
                  aria-expanded={trayOpen}
                  onClick={() => setTrayOpen((open) => !open)}
                >
                  <Palette />
                  {t("widgets:board.appearance.title")}
                </Button>
                <Button variant="ghost" size="sm" onClick={closingTray(onTemplates)}>
                  <LayoutTemplate />
                  {t("widgets:board.templates.title")}
                </Button>
              </div>
            </FadeScroll>
            <span className={boardMenuDivider()} aria-hidden />
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className={boardMenuDone()}
                    aria-label={t("board.done")}
                    onClick={closingTray(onDone)}
                  >
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
