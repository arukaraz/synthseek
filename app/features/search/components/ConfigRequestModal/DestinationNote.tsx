"use client";

import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { destinationLabel } from "./helpers";
import { destinationNote, lidarrTagChip } from "./styles";
import type { DestinationNoteProps } from "./types";

export function DestinationNote({ preview }: DestinationNoteProps) {
  const { t } = useTranslation("search");
  const label = destinationLabel(preview);

  if (preview.lock?.reason === "album_in_path") {
    return (
      <p className={destinationNote()}>
        <Lock className="size-3.5 shrink-0" />
        {t("config.destination.lockedInPath", { count: preview.lock.tracks, label })}
      </p>
    );
  }
  if (preview.lock?.reason === "album_on_its_way") {
    return (
      <p className={destinationNote()}>
        <Lock className="size-3.5 shrink-0" />
        {t("config.destination.lockedOnItsWay", { label })}
      </p>
    );
  }
  if (preview.matched.length === 0) {
    return <p className={destinationNote()}>{t("config.destination.noRule")}</p>;
  }
  return (
    <p className={destinationNote()}>
      {t("config.destination.matched", { count: preview.matched.length })}
      {preview.matched.map((rule) => (
        <span key={rule.id} className={lidarrTagChip()}>
          {rule.name}
        </span>
      ))}
    </p>
  );
}
