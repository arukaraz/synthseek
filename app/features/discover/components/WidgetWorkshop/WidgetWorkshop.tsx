"use client";

import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { DialogTitle } from "@components/ui/Dialog";
import { useWidgetPreview } from "@hooks/api/queries/widgets/useWidgetPreview";
import { browserTimeZone } from "@utils/time-zone";

import { useWidgetWorkshop } from "../../hooks/useWidgetWorkshop";
import { useWorkshopSave } from "../../hooks/useWorkshopSave";
import { DetailsSection } from "./DetailsSection";
import { previewableDraft } from "./helpers";
import { LookSection } from "./LookSection";
import { PlaylistSection } from "./PlaylistSection";
import { QuerySection } from "./QuerySection";
import {
  workshopActions,
  workshopAside,
  workshopCancel,
  workshopForm,
  workshopHeader,
  workshopLayout,
  workshopRoot,
  workshopScroll,
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

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  return (
    <div className={workshopRoot()}>
      <div className={workshopHeader()}>
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ChevronLeft />
          {t("workshop.back")}
        </Button>
        <DialogTitle className={workshopTitle()}>
          {rule
            ? t("workshop.ruleTitle", { name: draft.meta.name })
            : widgetId
              ? t("workshop.editTitle", { name: draft.meta.name })
              : t("workshop.newTitle")}
        </DialogTitle>
        <div className={workshopActions()}>
          <Button variant="ghost" size="sm" className={workshopCancel()} onClick={onLeave}>
            {t("workshop.cancel")}
          </Button>
          <Button size="sm" disabled={!save.ready || save.pending} onClick={save.save}>
            {save.pending ? t("workshop.saving") : rule ? t("workshop.saveRule") : t("workshop.save")}
          </Button>
        </div>
      </div>
      <div className={workshopScroll()}>
        <div className={workshopLayout()}>
          <aside className={workshopAside()} aria-label={t("workshop.preview")}>
            <WorkshopPreview
              draft={draft}
              result={preview.data}
              isLoading={preview.isLoading}
              isError={preview.isError}
            />
          </aside>
          <div className={workshopForm()}>
            <QuerySection workshop={workshop} context={context} />
            {rule ? (
              <PlaylistSection workshop={workshop} number={2} />
            ) : (
              <>
                <LookSection workshop={workshop} context={context} />
                <DetailsSection workshop={workshop} context={context} />
                {playlistable ? <PlaylistSection workshop={workshop} number={4} /> : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
