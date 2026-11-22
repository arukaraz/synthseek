"use client";

import { useTranslation } from "react-i18next";

import { useTrackPreview } from "@hooks/ui/trackPreview";

import { PreviewButton } from "./PreviewButton";
import { PreviewTime } from "./PreviewTime";
import { previewAudition, previewAuditionSeek, previewAuditionTime } from "./styles";
import type { PreviewAuditionProps } from "./types";

export function PreviewAudition({ clip, idleLabel }: PreviewAuditionProps) {
  const { t } = useTranslation("components");
  const audition = useTrackPreview(clip);
  const clock = audition.clock;

  return (
    <div className={previewAudition()}>
      <PreviewButton
        title={clip.title}
        subject={clip.subject}
        status={audition.status}
        clock={clock}
        available
        onToggle={audition.toggle}
      />
      <input
        type="range"
        className={previewAuditionSeek()}
        min={0}
        max={clock?.totalSeconds ?? 0}
        step={1}
        value={clock?.elapsedSeconds ?? 0}
        disabled={clock === null}
        aria-label={t("preview.fileSeek", { title: clip.title })}
        onChange={(event) => audition.seek(Number(event.target.value))}
      />
      <span className={previewAuditionTime()}>{clock ? <PreviewTime clock={clock} /> : idleLabel}</span>
    </div>
  );
}
