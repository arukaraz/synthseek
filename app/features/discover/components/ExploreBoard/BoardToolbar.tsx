"use client";

import { Check, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useRevealOnScrollUp } from "@hooks/ui/useRevealOnScrollUp";

import { CustomizeIcon } from "./CustomizeIcon";
import { boardDock, boardDockPill, boardFab, boardFabLabel, boardHint } from "./styles";
import type { BoardToolbarProps } from "./types";

export function BoardToolbar({ editing, onCustomize, onDone, onAddWidget }: BoardToolbarProps) {
  const { t } = useTranslation("discover");
  const reveal = useRevealOnScrollUp<HTMLButtonElement>();

  return (
    <div className={boardDock()}>
      {editing ? (
        <div className={boardDockPill()} role="toolbar" aria-label={t("board.customize")}>
          <p className={boardHint()}>{t("board.editHint")}</p>
          <Button variant="ghost" size="sm" onClick={onAddWidget}>
            <Plus />
            {t("board.addWidget")}
          </Button>
          <Button size="sm" onClick={onDone}>
            <Check />
            {t("board.done")}
          </Button>
        </div>
      ) : (
        <button
          ref={reveal.ref}
          type="button"
          className={boardFab({ revealed: reveal.revealed })}
          onClick={onCustomize}
          title={t("board.customize")}
        >
          <CustomizeIcon />
          <span className={boardFabLabel()}>{t("board.customize")}</span>
        </button>
      )}
    </div>
  );
}
