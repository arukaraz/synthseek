"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCurrentVersion } from "@hooks/api/queries/useCurrentVersion";
import { usePatchNotes } from "@hooks/api/queries/usePatchNotes";
import { PATCH_NOTES_URL } from "@utils/version";

import { TimelineEntry } from "./TimelineEntry";
import { entryVariant } from "./helpers";
import { emptyState, endLink, endNode, endWrap, stateText, timeline, timelineLine } from "./styles";

export function PatchNotesTimeline() {
  const { t } = useTranslation("settings");
  const patchNotes = usePatchNotes();
  const current = useCurrentVersion();

  const versions = patchNotes.data?.versions ?? [];
  const currentVersion = current.data?.currentVersion ?? null;

  if (patchNotes.isLoading) {
    return <div className={stateText()}>{t("updates.notes.loading")}</div>;
  }

  if (versions.length === 0) {
    return <div className={emptyState()}>{t("updates.notes.empty")}</div>;
  }

  return (
    <div className={timeline()}>
      <span className={timelineLine()} aria-hidden />
      {versions.map((entry, index) => (
        <TimelineEntry
          key={entry.version}
          entry={entry}
          variant={entryVariant(entry.version, currentVersion, index === 0)}
        />
      ))}
      <div className={endWrap()}>
        <span className={endNode()} aria-hidden />
        <a href={PATCH_NOTES_URL} target="_blank" rel="noopener noreferrer" className={endLink()}>
          {t("updates.notes.olderOnGitHub")}
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
