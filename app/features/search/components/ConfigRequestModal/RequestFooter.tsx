"use client";

import { bottomSheetFooter } from "@components/ui/BottomSheet";

import { footerSummary, footerSummaryNote, footerSummaryTitle } from "./styles";
import type { RequestFooterProps } from "./types";

export function RequestFooter({ summary, note, children }: RequestFooterProps) {
  return (
    <div className={bottomSheetFooter()}>
      <div className={footerSummary()}>
        {summary ? <span className={footerSummaryTitle()}>{summary}</span> : null}
        {note ? <span className={footerSummaryNote()}>{note}</span> : null}
      </div>
      {children}
    </div>
  );
}
