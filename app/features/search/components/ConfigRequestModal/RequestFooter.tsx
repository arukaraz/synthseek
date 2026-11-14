"use client";

import { bottomSheetFooter } from "@components/ui/BottomSheet";
import { Checkbox } from "@components/ui/Checkbox";
import { useTranslation } from "react-i18next";

import { footerKeepRequesting, footerSummary, footerSummaryNote, footerSummaryTitle } from "./styles";
import type { RequestFooterProps } from "./types";

export function RequestFooter({ summary, note, keepRequesting, children }: RequestFooterProps) {
  const { t } = useTranslation("search");
  return (
    <div className={bottomSheetFooter()}>
      <div className={footerSummary()}>
        {summary ? <span className={footerSummaryTitle()}>{summary}</span> : null}
        {note ? <span className={footerSummaryNote()}>{note}</span> : null}
      </div>
      {keepRequesting ? (
        <label className={footerKeepRequesting()} title={t("config.keepRequesting.hint")}>
          <Checkbox
            checked={keepRequesting.checked}
            onCheckedChange={(checked) => keepRequesting.onChange(checked === true)}
            data-cy="keep-requesting-checkbox"
          />
          {t("config.keepRequesting.label")}
        </label>
      ) : null}
      {children}
    </div>
  );
}
