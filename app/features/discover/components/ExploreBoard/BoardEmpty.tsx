"use client";

import { LayoutGrid, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { EmptyState } from "@components/ui/EmptyState";

import { emptyBoard } from "./styles";
import type { BoardEmptyProps } from "./types";

export function BoardEmpty({ onAddWidget }: BoardEmptyProps) {
  const { t } = useTranslation("discover");
  return (
    <div className={emptyBoard()}>
      <EmptyState icon={LayoutGrid} title={t("board.empty.title")} description={t("board.empty.description")} />
      <Button size="sm" onClick={onAddWidget}>
        <Plus />
        {t("board.addWidget")}
      </Button>
    </div>
  );
}
