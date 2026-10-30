"use client";

import { Braces, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { newCard, newCardButton } from "./styles";
import type { NewWidgetCardProps } from "./types";

export function NewWidgetCard({ onCreate, onImport }: NewWidgetCardProps) {
  const { t } = useTranslation("widgets");

  return (
    <div className={newCard()}>
      <button type="button" className={newCardButton()} aria-label={t("mine.newWidget")} onClick={onCreate}>
        <Plus aria-hidden />
      </button>
      <Button variant="ghost" size="sm" onClick={onImport}>
        <Braces />
        {t("mine.fromJson")}
      </Button>
    </div>
  );
}
