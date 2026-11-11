"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { TRACK_PREVIEW, clockFraction, isSounding } from "@hooks/ui/trackPreview";
import { Play, Square, TriangleAlert, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PREVIEW_ACTION_KEYS, PREVIEW_TOOLTIP_DELAY_MS } from "./constants";
import { PreviewRing } from "./PreviewRing";
import { previewButton, previewGlyph } from "./styles";
import type { PreviewButtonProps } from "./types";

export function PreviewButton({
  title,
  subject = "preview",
  status,
  clock,
  available,
  onToggle,
  tone = "row",
}: PreviewButtonProps) {
  const { t } = useTranslation("components");
  const keys = PREVIEW_ACTION_KEYS[subject];
  const failed = available && status === "error";
  const locked = !available || failed;
  const sounding = isSounding(status);
  const seconds = TRACK_PREVIEW.CLIP_SECONDS;
  const LockedGlyph = failed ? TriangleAlert : VolumeX;
  const ReadyGlyph = sounding ? Square : Play;

  return (
    <TooltipProvider delayDuration={PREVIEW_TOOLTIP_DELAY_MS}>
      <Tooltip>
        <TooltipTrigger asChild>
          {locked ? (
            <span
              className={previewButton({ tone, state: failed ? "failed" : "locked" })}
              role="button"
              tabIndex={0}
              aria-disabled="true"
              aria-label={t(failed ? keys.failed : "preview.none", { title })}
              data-preview={failed ? "error" : "none"}
              onClick={(event) => event.stopPropagation()}
            >
              <LockedGlyph className={previewGlyph({ tone })} aria-hidden />
            </span>
          ) : (
            <button
              type="button"
              className={previewButton({ tone, state: "ready" })}
              aria-label={t(sounding ? keys.stop : keys.play, { title, seconds })}
              aria-busy={status === "loading"}
              data-preview={status}
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
            >
              <PreviewRing status={status} fraction={clockFraction(clock)} tone={tone} />
              <ReadyGlyph className={previewGlyph({ tone })} aria-hidden />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {locked
            ? t(failed ? keys.failedHint : "preview.noneHint")
            : t(sounding ? keys.stopHint : keys.playHint, { seconds })}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
