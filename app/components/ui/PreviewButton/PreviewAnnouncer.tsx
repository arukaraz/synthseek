"use client";

import { useTrackPreviewNotice } from "@hooks/ui/trackPreview";
import { useTranslation } from "react-i18next";

import { PREVIEW_NOTICE_KEYS } from "./constants";

export function PreviewAnnouncer() {
  const { t } = useTranslation("components");
  const notice = useTrackPreviewNotice();
  const keys = notice === null ? null : PREVIEW_NOTICE_KEYS[notice.subject][notice.kind];

  return (
    <span role="status" aria-live="polite" className="sr-only" data-cy="preview-announcer">
      {notice === null || keys === null
        ? null
        : t(notice.resumesPlayer ? keys.withPlayer : keys.plain, { title: notice.title })}
    </span>
  );
}
