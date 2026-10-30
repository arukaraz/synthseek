"use client";

import { useTranslation } from "react-i18next";

import { CustomWidgetContent } from "../CustomWidget/CustomWidgetContent";
import { previewHeightOf } from "./helpers";
import { previewFrame, previewHint, previewLabel, previewVars } from "./styles";
import type { WorkshopPreviewProps } from "./types";

export function WorkshopPreview({ draft, result, isLoading, isError }: WorkshopPreviewProps) {
  const { t } = useTranslation("widgets");

  return (
    <>
      <span className={previewLabel()}>{t("workshop.preview")}</span>
      <div
        className={previewFrame({ size: draft.defaultSize })}
        style={previewVars(previewHeightOf(draft.view.block, draft.defaultSize))}
        inert
      >
        <CustomWidgetContent
          widget={draft}
          size={draft.defaultSize}
          result={result}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
      <p className={previewHint()}>{t("workshop.previewHint")}</p>
    </>
  );
}
