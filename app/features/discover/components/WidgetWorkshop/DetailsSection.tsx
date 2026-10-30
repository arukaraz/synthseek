"use client";

import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { SegmentTabs } from "@components/ui/SegmentTabs";

import { WORKSHOP_SIZES } from "./constants";
import { IconPicker } from "./IconPicker";
import { detailsGrid, fieldLabel, section, sectionHead, sectionNumber, sectionTitle } from "./styles";
import type { WorkshopSectionProps } from "./types";

export function DetailsSection({ workshop, context }: WorkshopSectionProps) {
  const { t } = useTranslation("widgets");
  const { meta, defaultSize } = workshop.draft;
  const { limits } = context.catalog;

  return (
    <section className={section()} aria-labelledby="workshop-details-title">
      <div className={sectionHead()}>
        <span className={sectionNumber()}>3</span>
        <h3 id="workshop-details-title" className={sectionTitle()}>
          {t("workshop.sections.details")}
        </h3>
      </div>
      <div className={detailsGrid()}>
        <label className={fieldLabel()}>
          {t("details.name")}
          <Input
            size="sm"
            value={meta.name}
            maxLength={limits.nameMaxLength}
            onChange={(event) => workshop.setName(event.target.value)}
          />
        </label>
        <label className={fieldLabel()}>
          {t("details.description")}
          <Input
            size="sm"
            value={meta.description}
            maxLength={limits.descriptionMaxLength}
            placeholder={t("details.descriptionPlaceholder")}
            onChange={(event) => workshop.setDescription(event.target.value)}
          />
        </label>
      </div>
      <div className={fieldLabel()}>
        {t("details.icon")}
        <IconPicker icons={context.catalog.icons} value={meta.icon} onChange={workshop.setIcon} />
      </div>
      <div className={fieldLabel()}>
        {t("details.size")}
        <SegmentTabs
          items={WORKSHOP_SIZES.map((size) => ({ value: size, label: t(`sizes.${size}`) }))}
          value={defaultSize}
          onValueChange={workshop.setSize}
          layoutId="widget-workshop-size"
          ariaLabel={t("details.size")}
        />
      </div>
    </section>
  );
}
