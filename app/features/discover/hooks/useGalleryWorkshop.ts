"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDraft } from "@hooks/api/queries/widgets/types";
import { useMyWidgets } from "@hooks/api/queries/widgets/useMyWidgets";
import { useWidgetPresets } from "@hooks/api/queries/widgets/useWidgetPresets";
import { useCountry } from "@modules/providers/CountryProvider";

import type { GalleryWorkshop } from "../components/WidgetsDialog/types";
import { BOARD_WIDGETS } from "../components/ExploreBoard/constants";
import type { BoardGalleryTarget } from "../components/ExploreBoard/types";
import { customizedDraftOf, draftOf, presetFor } from "../components/WidgetGallery/helpers";
import type { GalleryMode } from "../components/WidgetGallery/types";
import type { WorkshopOpening } from "../components/WidgetWorkshop/types";

export function useGalleryWorkshop(target: BoardGalleryTarget | null): GalleryWorkshop {
  const { t } = useTranslation("discover");
  const [mode, setMode] = useState<GalleryMode>("widgets");
  const [opening, setOpening] = useState<WorkshopOpening | null>(null);
  const [returnTo, setReturnTo] = useState<GalleryMode>("mine");
  const [pendingTarget, setPendingTarget] = useState(target);
  const [dirty, setDirty] = useState(false);
  const myWidgets = useMyWidgets();
  const presets = useWidgetPresets();
  const { country } = useCountry();

  const open = useCallback((draft: WidgetDraft, widgetId: string | null, from: GalleryMode, customizing?: string) => {
    setDirty(false);
    setReturnTo(from);
    setOpening({ draft, widgetId, purpose: "widget", customizing });
  }, []);

  const canCustomize = useCallback(
    (widget: BoardWidgetKey) => presetFor(presets.data, widget) !== undefined,
    [presets.data]
  );

  const customize = useCallback(
    (widget: BoardWidgetKey) => {
      const preset = presetFor(presets.data, widget);
      if (!preset) return;
      const title = t(BOARD_WIDGETS[widget].titleKey);
      open(customizedDraftOf(preset, title, country), null, "widgets", title);
    },
    [country, open, presets.data, t]
  );

  useEffect(() => {
    if (!pendingTarget) return;
    if (pendingTarget.kind === "builtin") {
      if (!presets.data) return;
      setPendingTarget(null);
      customize(pendingTarget.widget);
      return;
    }
    if (!myWidgets.data) return;
    setPendingTarget(null);
    const widget = myWidgets.data.find((candidate) => candidate.id === pendingTarget.widgetId);
    if (widget) open(draftOf(widget), widget.id, "mine");
  }, [customize, myWidgets.data, open, pendingTarget, presets.data]);

  const back = useCallback(() => {
    setOpening(null);
    setDirty(false);
    setMode(returnTo);
  }, [returnTo]);

  return { mode, setMode, opening, dirty, setDirty, open, canCustomize, customize, back };
}
