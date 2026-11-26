"use client";

import { Blocks, Palette, Plus, SquareDashed } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { Button } from "@components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";

import { BOARD_SETTINGS_HREF } from "./constants";
import {
  boardEditBar,
  boardEditDot,
  boardEditHint,
  boardEditStatus,
  boardEditTitle,
  boardMenuActions,
  boardMenuDivider,
  boardMenuToggle,
} from "./styles";
import type { BoardEditBarProps } from "./types";

export function BoardEditBar({ onAddSpacer, onWidgets }: BoardEditBarProps) {
  const { t } = useTranslation(["discover", "widgets"]);

  return (
    <div className={boardEditBar()} role="toolbar" aria-label={t("board.customize")}>
      <div className={boardEditStatus()}>
        <span className={boardEditDot()} aria-hidden />
        <span className={boardEditTitle()}>{t("board.editBar.title")}</span>
        <span className={boardEditHint()}>{t("board.editBar.hint")}</span>
      </div>
      <span className={boardMenuDivider()} aria-hidden />
      <FadeScroll axis="x">
        <div className={boardMenuActions()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={boardMenuToggle()}>
                <Plus />
                {t("board.add.action")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
              <DropdownMenuItem onSelect={onWidgets}>
                <Blocks />
                {t("widgets:board.widgetsDialog.action")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onAddSpacer}>
                <SquareDashed />
                {t("board.spacer.name")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" asChild>
            <Link href={BOARD_SETTINGS_HREF}>
              <Palette />
              {t("widgets:board.appearance.title")}
            </Link>
          </Button>
        </div>
      </FadeScroll>
    </div>
  );
}
