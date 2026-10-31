"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { useSetList } from "@hooks/api/queries/widgets/useSetList";

import { noteText } from "./helpers";
import { SmartListHeader } from "./SmartListHeader";
import { SmartSuggestionRow } from "./SmartSuggestionRow";
import { SmartTrackRow } from "./SmartTrackRow";
import { SmartVersions } from "./SmartVersions";
import { dialogBody, empty, note, rows, sectionLabel, sub, tabsRow, title } from "./styles";
import type { SmartListDialogProps, SmartListTab } from "./types";

export function SmartListDialog({ widgetId, slotId, accent, onClose }: SmartListDialogProps) {
  const { t } = useTranslation("discover");
  const [tab, setTab] = useState<SmartListTab>("tracks");
  const { data: detail, isError } = useSetList(widgetId, slotId);
  const openerRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent
        data-acc={accent}
        className={dialogBody()}
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (openerRef.current?.isConnected) openerRef.current.focus();
        }}
      >
        {detail ? (
          <>
            <SmartListHeader widgetId={widgetId} detail={detail} />
            <DialogDescription className="sr-only">{t("smartList.description")}</DialogDescription>
            <div className={tabsRow()}>
              <SegmentedControl
                ariaLabel={t("smartList.tabs")}
                value={tab}
                options={[
                  { value: "tracks", label: t("smartList.tracksTab", { count: detail.tracks.length }) },
                  { value: "removed", label: t("smartList.removedTab", { count: detail.removed.length }) },
                  { value: "versions", label: t("smartList.versionsTab", { count: detail.versions.length }) },
                ]}
                onChange={setTab}
              />
            </div>
            <div className={rows()}>
              {detail.notes.map((entry) => (
                <p key={entry.kind} className={note()}>
                  {noteText(entry)}
                </p>
              ))}
              {tab === "tracks" ? detail.tracks.map((track) => <SmartTrackRow key={track.id} track={track} />) : null}
              {tab === "tracks" && detail.suggestions.length > 0 ? (
                <>
                  <span className={sectionLabel()}>{t("smartList.suggestions")}</span>
                  {detail.suggestions.map((suggestion) => (
                    <SmartSuggestionRow key={suggestion.catalogTrackId} suggestion={suggestion} />
                  ))}
                </>
              ) : null}
              {tab === "removed" && detail.removed.length === 0 ? (
                <p className={empty()}>{t("smartList.nothingRemoved")}</p>
              ) : null}
              {tab === "removed" && detail.removed.length > 0 ? (
                <p className={sub()}>{t("smartList.removedHint")}</p>
              ) : null}
              {tab === "removed" ? detail.removed.map((track) => <SmartTrackRow key={track.id} track={track} />) : null}
              {tab === "versions" ? <SmartVersions widgetId={widgetId} detail={detail} /> : null}
            </div>
          </>
        ) : (
          <>
            <DialogTitle className={title()}>{t("smartList.loadingTitle")}</DialogTitle>
            <p className={empty()}>{isError ? t("smartList.loadError") : t("smartList.loading")}</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
