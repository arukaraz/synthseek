"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PRESET_ORIGIN_KEYS, RECIPE_ROW_LABEL_KEYS } from "./constants";
import { DestinationField } from "./DestinationField";
import { changedRecipeRows, describeRow, recipeRows, restoreRow } from "./helpers";
import { MatchingEditor } from "./MatchingEditor";
import { PeerEditor } from "./PeerEditor";
import { QualityEditor } from "./QualityEditor";
import { RecipeRow } from "./RecipeRow";
import { SourceEditor } from "./SourceEditor";
import { recipeHead, recipeHeading, recipeHint, recipeList, recipeRestore, sectionStack } from "./styles";
import type { RecipeRowKey, RequestRecipeProps } from "./types";

export function RequestRecipe({
  selection,
  base,
  onChange,
  locked,
  origin,
  offered,
  lidarrAvailable,
  lidarrSlot,
  destination,
}: RequestRecipeProps) {
  const { t } = useTranslation("search");
  const [openRow, setOpenRow] = useState<RecipeRowKey | null>(null);
  const rows = recipeRows(selection, destination !== null);
  const changed = locked ? [] : changedRecipeRows(selection, base, destination !== null, destination?.value ?? null);

  const restore = (key: RecipeRowKey) => {
    if (key === "destination") {
      destination?.onChange(null);
      return;
    }
    onChange(restoreRow(key, selection, base));
  };

  const restoreAll = () => {
    onChange(base);
    destination?.onChange(null);
    setOpenRow(null);
  };

  const editorFor = (key: RecipeRowKey) => {
    switch (key) {
      case "source":
        return (
          <SourceEditor
            selection={selection.acquisition}
            offered={offered}
            lidarrAvailable={lidarrAvailable}
            lidarrSlot={lidarrSlot}
            onChange={(acquisition) => onChange({ ...selection, acquisition })}
          />
        );
      case "quality":
        return <QualityEditor value={selection} onChange={onChange} />;
      case "matching":
        return <MatchingEditor value={selection} onChange={onChange} />;
      case "peer":
        return <PeerEditor value={selection} onChange={onChange} />;
      case "destination":
        return destination ? <DestinationField {...destination} /> : null;
    }
  };

  return (
    <div className={sectionStack()}>
      <div className={recipeHead()}>
        <span className={recipeHeading()}>
          {changed.length > 0 ? t("config.preset.changes", { count: changed.length }) : t("config.preset.heading")}
        </span>
        {changed.length > 0 ? (
          <button type="button" className={recipeRestore()} onClick={restoreAll}>
            <RotateCcw className="size-3.5" aria-hidden />
            {t("config.preset.restoreAll")}
          </button>
        ) : (
          <span className={recipeHint()}>
            {locked ? t("config.preset.adminOnly") : origin ? t(PRESET_ORIGIN_KEYS[origin]) : null}
          </span>
        )}
      </div>
      <div className={recipeList()} data-cy={locked ? "request-preset-locked" : "request-preset-rows"}>
        {rows.map((key) => (
          <RecipeRow
            key={key}
            label={t(RECIPE_ROW_LABEL_KEYS[key])}
            value={describeRow(key, selection, destination, t)}
            changed={changed.includes(key)}
            locked={locked}
            open={openRow === key}
            onToggle={() => setOpenRow((current) => (current === key ? null : key))}
            onRestore={() => restore(key)}
            dataCy={key === "destination" ? "request-destination" : undefined}
          >
            {editorFor(key)}
          </RecipeRow>
        ))}
      </div>
    </div>
  );
}
