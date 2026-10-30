"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { useElementWidth } from "@hooks/ui/useElementWidth";

import { CustomWidgetContent } from "../CustomWidget/CustomWidgetContent";
import { copyWidgetJson, customPreviewFrame, draftJsonOf } from "../WidgetGallery/helpers";
import { ScaledPreview } from "../WidgetGallery/ScaledPreview";
import { WORKSHOP_SIZES } from "./constants";
import { previewBar, previewBox, previewCopy, previewHint, previewJson, previewLabel, previewTools } from "./styles";
import type { WorkshopPreviewProps } from "./types";

export function WorkshopPreview({ draft, result, isLoading, isError, onSizeChange }: WorkshopPreviewProps) {
  const { t } = useTranslation("widgets");
  const [showJson, setShowJson] = useState(false);
  const [measure, width] = useElementWidth<HTMLDivElement>();
  const size = draft.defaultSize;
  const json = draftJsonOf(draft);

  return (
    <>
      <div className={previewBar()}>
        <span className={previewLabel()}>{t("workshop.preview")}</span>
        <div className={previewTools()}>
          <SegmentedControl
            ariaLabel={t("details.size")}
            value={size}
            options={WORKSHOP_SIZES.map((value) => ({ value, label: t(`sizes.${value}`) }))}
            onChange={onSizeChange}
          />
          <Button variant="ghost" size="sm" aria-pressed={showJson} onClick={() => setShowJson((shown) => !shown)}>
            {t("mine.json")}
          </Button>
        </div>
      </div>
      <div ref={measure} className={previewBox()}>
        <ScaledPreview frame={customPreviewFrame(draft.view.block, size, width)}>
          <CustomWidgetContent widget={draft} size={size} result={result} isLoading={isLoading} isError={isError} />
        </ScaledPreview>
      </div>
      {showJson ? (
        <>
          <pre className={previewJson()}>{json}</pre>
          <Button
            variant="ghost"
            size="sm"
            className={previewCopy()}
            onClick={() => copyWidgetJson(json, draft.meta.name)}
          >
            {t("workshop.copyJson")}
          </Button>
        </>
      ) : (
        <p className={previewHint()}>{t("workshop.previewHint")}</p>
      )}
    </>
  );
}
