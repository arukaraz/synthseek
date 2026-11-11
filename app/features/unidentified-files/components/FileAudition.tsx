"use client";

import { useTranslation } from "react-i18next";

import { PreviewButton, PreviewTime } from "@components/ui/PreviewButton";
import { fileAuditionClip, useTrackPreview } from "@hooks/ui/trackPreview";

import { lengthLabel } from "../helpers";
import { fileAudition, fileAuditionSeek, fileAuditionTime } from "../styles";
import type { FileAuditionProps } from "../types";

export function FileAudition({ file }: FileAuditionProps) {
  const { t } = useTranslation("components");
  const audition = useTrackPreview(fileAuditionClip(file.id, file.title, file.durationSeconds));
  const clock = audition.clock;

  return (
    <div className={fileAudition()}>
      <PreviewButton
        title={file.title}
        subject="file"
        status={audition.status}
        clock={clock}
        available
        onToggle={audition.toggle}
      />
      <input
        type="range"
        className={fileAuditionSeek()}
        min={0}
        max={clock?.totalSeconds ?? 0}
        step={1}
        value={clock?.elapsedSeconds ?? 0}
        disabled={clock === null}
        aria-label={t("preview.fileSeek", { title: file.title })}
        onChange={(event) => audition.seek(Number(event.target.value))}
      />
      <span className={fileAuditionTime()}>
        {clock ? <PreviewTime clock={clock} /> : lengthLabel(file.durationSeconds)}
      </span>
    </div>
  );
}
