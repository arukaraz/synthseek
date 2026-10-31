"use client";

import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { ModalActionBar } from "@components/ui/ModalActionBar";
import { useWidgetPreview } from "@hooks/api/queries/widgets/useWidgetPreview";
import { browserTimeZone } from "@utils/time-zone";

import { useWidgetWorkshop } from "../../hooks/useWidgetWorkshop";
import { useWorkshopSave } from "../../hooks/useWorkshopSave";
import { DetailsSection } from "./DetailsSection";
import { previewableDraft } from "./helpers";
import { LookSection } from "./LookSection";
import { PlaylistChoice } from "./PlaylistChoice";
import { PlaylistSection } from "./PlaylistSection";
import { SegmentTabs } from "@components/ui/SegmentTabs";

import { WIDGET_KINDS } from "./constants";
import { QuerySection } from "./QuerySection";
import {
  kindLabel,
  kindSwitch,
  workshopAside,
  workshopForm,
  workshopHeader,
  workshopHeading,
  workshopLayout,
  workshopRoot,
  workshopScroll,
  workshopSubtitle,
  workshopTitle,
} from "./styles";
import type { WidgetWorkshopProps } from "./types";
import { WorkshopPreview } from "./WorkshopPreview";

export function WidgetWorkshop({ opening, context, onLeave, onDirtyChange, onSaved }: WidgetWorkshopProps) {
  const { t } = useTranslation("widgets");
  const workshop = useWidgetWorkshop(opening, context);
  const [timeZone] = useState(browserTimeZone);
  const preview = useWidgetPreview(previewableDraft(workshop.previewDraft, t("workshop.newTitle")), timeZone);
  const save = useWorkshopSave(workshop, timeZone, onSaved);
  const { draft, dirty, widgetId, purpose, playlistable } = workshop;
  const rule = purpose === "rule";
  const { customizing } = opening;
  const title = rule
    ? t("workshop.ruleTitle", { name: draft.meta.name })
    : widgetId
      ? t("workshop.editTitle", { name: draft.meta.name })
      : customizing
        ? t("workshop.customizeTitle", { name: customizing })
        : t("workshop.newTitle");
  const saveLabel = rule ? t("workshop.saveRule") : widgetId ? t("workshop.saveChanges") : t("workshop.saveToMine");

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  return (
    <div className={workshopRoot()}>
      <div className={workshopHeader()}>
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ChevronLeft />
          {t("workshop.back")}
        </Button>
        <div className={workshopHeading()}>
          <DialogTitle className={workshopTitle()}>{title}</DialogTitle>
          {customizing ? (
            <DialogDescription className={workshopSubtitle()}>{t("workshop.customizeHint")}</DialogDescription>
          ) : null}
        </div>
        {purpose === "widget" ? (
          <div className={kindSwitch()}>
            <span className={kindLabel()}>{t("workshop.buildUsing")}</span>
            <SegmentTabs
              items={WIDGET_KINDS.map((kind) => ({ value: kind, label: t(`kinds.${kind}`) }))}
              value={workshop.kind}
              onValueChange={workshop.setKind}
              layoutId="widget-workshop-kind"
              ariaLabel={t("workshop.kindLabel")}
            />
          </div>
        ) : null}
      </div>
      <div className={workshopScroll()}>
        <div className={workshopLayout()}>
          <aside className={workshopAside()} aria-label={t("workshop.preview")}>
            <WorkshopPreview
              draft={draft}
              result={preview.data}
              isLoading={preview.isLoading}
              isError={preview.isError}
              onSizeChange={workshop.setSize}
            />
          </aside>
          <div className={workshopForm()}>
            <QuerySection workshop={workshop} context={context} preview={preview.data} />
            {rule ? (
              <PlaylistSection workshop={workshop} />
            ) : (
              <>
                <LookSection workshop={workshop} context={context} />
                <DetailsSection workshop={workshop} context={context} />
              </>
            )}
          </div>
        </div>
      </div>
      <ModalActionBar
        choice={!rule && playlistable ? <PlaylistChoice workshop={workshop} /> : undefined}
        cancel={{ label: t("workshop.cancel"), onClick: onLeave }}
        save={{
          label: save.pending ? t("workshop.saving") : saveLabel,
          onClick: save.save,
          disabled: !save.ready || save.pending,
        }}
      />
    </div>
  );
}
