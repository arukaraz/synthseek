"use client";

import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { DialogTitle } from "@components/ui/Dialog";
import { useSaveWidget } from "@hooks/api/mutations/widgets/useSaveWidget";
import { useWidgetPreview } from "@hooks/api/queries/widgets/useWidgetPreview";
import { browserTimeZone } from "@utils/time-zone";

import { useWidgetWorkshop } from "../../hooks/useWidgetWorkshop";
import { DetailsSection } from "./DetailsSection";
import { previewableDraft } from "./helpers";
import { LookSection } from "./LookSection";
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
  const save = useSaveWidget();
  const { draft, dirty, widgetId } = workshop;
  const named = draft.meta.name.trim().length > 0;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  return (
    <div className={workshopRoot()}>
      <div className={workshopHeader()}>
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ChevronLeft />
          {t("workshop.back")}
        </Button>
        <DialogTitle className={workshopTitle()}>
          {widgetId ? t("workshop.editTitle", { name: draft.meta.name }) : t("workshop.newTitle")}
        </DialogTitle>
        <div className={workshopActions()}>
          <Button variant="ghost" size="sm" className={workshopCancel()} onClick={onLeave}>
            {t("workshop.cancel")}
          </Button>
          <Button
            size="sm"
            disabled={!named || save.isPending}
            onClick={() =>
              save.mutate(widgetId ? { ...draft, id: widgetId } : draft, { onSuccess: (saved) => onSaved(saved) })
            }
          >
            {save.isPending ? t("workshop.saving") : t("workshop.save")}
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
            <LookSection workshop={workshop} context={context} />
            <DetailsSection workshop={workshop} context={context} />
          </div>
        </div>
      </div>
    </div>
  );
}
