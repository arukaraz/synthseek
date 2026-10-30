"use client";

import { Check, LayoutGrid, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { CustomizeIcon } from "./CustomizeIcon";
import { boardDock, boardFab, boardFabLabel, boardMenu, boardMenuDivider } from "./styles";
import type { BoardToolbarProps } from "./types";

export function BoardToolbar({ editing, onCustomize, onDone, onAddWidget, onArrange }: BoardToolbarProps) {
  const { t } = useTranslation("discover");

  return (
    <div className={boardDock({ editing })}>
      {editing ? (
        <div className={boardMenu()} role="toolbar" aria-label={t("board.customize")}>
          <Button variant="ghost" size="sm" onClick={onAddWidget}>
            <Plus />
            {t("board.addWidget")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onArrange}>
            <LayoutGrid />
            {t("board.arrange.action")}
          </Button>
          <span className={boardMenuDivider()} aria-hidden />
          <Button size="sm" onClick={onDone}>
            <Check />
            {t("board.done")}
          </Button>
        </div>
      ) : (
        <button type="button" className={boardFab()} onClick={onCustomize} title={t("board.customize")}>
          <CustomizeIcon />
          <span className={boardFabLabel()}>{t("board.customize")}</span>
        </button>
      )}
    </div>
  );
}
