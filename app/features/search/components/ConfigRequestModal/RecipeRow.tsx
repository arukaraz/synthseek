"use client";

import { ChevronRight, Lock, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  recipeChangedDot,
  recipeChevron,
  recipeEditor,
  recipeRestore,
  recipeRow,
  recipeRowButton,
  recipeRowLabel,
  recipeRowTrail,
  recipeRowValue,
} from "./styles";
import type { RecipeRowProps } from "./types";

export function RecipeRow({
  label,
  value,
  changed,
  locked,
  open,
  onToggle,
  onRestore,
  dataCy,
  children,
}: RecipeRowProps) {
  const { t } = useTranslation("search");
  const expanded = open && !locked;

  return (
    <div className={recipeRow({ open: expanded })} data-cy={dataCy}>
      <button
        type="button"
        className={recipeRowButton()}
        onClick={onToggle}
        disabled={locked}
        aria-expanded={locked ? undefined : expanded}
      >
        <span className={recipeRowLabel()}>{label}</span>
        <span className={recipeRowValue()}>{value}</span>
        <span className={recipeRowTrail()}>
          {changed ? (
            <>
              <span className={recipeChangedDot()} aria-hidden />
              <span className="sr-only">{t("config.preset.changed")}</span>
            </>
          ) : null}
          {locked ? (
            <Lock className="size-3.5" aria-hidden />
          ) : (
            <ChevronRight className={recipeChevron({ open: expanded })} aria-hidden />
          )}
        </span>
      </button>
      {expanded ? (
        <div className={recipeEditor()}>
          {children}
          {changed ? (
            <button type="button" className={recipeRestore()} onClick={onRestore}>
              <RotateCcw className="size-3.5" aria-hidden />
              {t("config.preset.restoreRow")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
