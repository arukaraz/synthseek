"use client";

import { Check, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { CustomizeIcon } from "./CustomizeIcon";
import { boardHint, boardToolbar } from "./styles";
import type { BoardToolbarProps } from "./types";

export function BoardToolbar({ editing, onCustomize, onDone, onAddWidget }: BoardToolbarProps) {
  const { t } = useTranslation("discover");

  if (!editing) {
    return (
      <div className={boardToolbar()}>
        <Button variant="ghost" size="sm" onClick={onCustomize}>
          <CustomizeIcon />
          {t("board.customize")}
        </Button>
      </div>
    );
  }

  return (
    <div className={boardToolbar()}>
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
  );
}
