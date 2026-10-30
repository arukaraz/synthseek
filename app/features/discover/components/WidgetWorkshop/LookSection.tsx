"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { SelectMenu } from "@components/ui/SelectMenu";

import { viewChoicesOf } from "./helpers";
import {
  accentDot,
  accentRow,
  fieldLabel,
  lookGrid,
  section,
  sectionHead,
  sectionNumber,
  sectionTitle,
  viewGrid,
  viewSuggested,
  viewTile,
  viewToggle,
} from "./styles";
import type { WorkshopSectionProps } from "./types";

export function LookSection({ workshop, context }: WorkshopSectionProps) {
  const { t } = useTranslation("widgets");
  const [showAll, setShowAll] = useState(false);
  const { view, meta } = workshop.draft;
  const choices = viewChoicesOf(context.catalog, workshop.fitting, showAll);

  return (
    <section className={section()} aria-labelledby="workshop-look-title">
      <div className={sectionHead()}>
        <span className={sectionNumber()}>2</span>
        <h3 id="workshop-look-title" className={sectionTitle()}>
          {t("workshop.sections.look")}
        </h3>
      </div>
      <div className={viewGrid()} role="radiogroup" aria-label={t("look.label")}>
        {choices.map((choice) => (
          <button
            key={choice.block}
            type="button"
            role="radio"
            aria-checked={view.block === choice.block}
            aria-disabled={!choice.fits}
            title={choice.fits ? undefined : t("look.notFitting")}
            className={viewTile({ selected: view.block === choice.block, fits: choice.fits })}
            onClick={() => {
              if (choice.fits) workshop.setBlock(choice.block);
            }}
          >
            <span>{t(`blocks.${choice.block}`)}</span>
            {choice.suggested ? <span className={viewSuggested()}>{t("look.suggested")}</span> : null}
          </button>
        ))}
      </div>
      <button type="button" className={viewToggle()} onClick={() => setShowAll((value) => !value)}>
        {showAll ? t("look.fittingViews") : t("look.allViews", { count: context.catalog.blocks.length })}
      </button>
      <div className={lookGrid()}>
        <label className={fieldLabel()}>
          {t("look.action")}
          <SelectMenu
            ariaLabel={t("look.action")}
            value={view.action}
            options={context.catalog.actions.map((action) => ({ value: action, label: t(`actions.${action}`) }))}
            onChange={workshop.setAction}
          />
        </label>
        <div className={fieldLabel()}>
          {t("look.accent")}
          <div className={accentRow()} role="radiogroup" aria-label={t("look.accent")}>
            {context.catalog.accents.map((accent) => (
              <button
                key={accent}
                type="button"
                role="radio"
                data-acc={accent}
                aria-checked={meta.accent === accent}
                aria-label={t(`accents.${accent}`)}
                title={t(`accents.${accent}`)}
                className={accentDot({ selected: meta.accent === accent })}
                onClick={() => workshop.setAccent(accent)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
