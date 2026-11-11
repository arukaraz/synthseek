import { PREVIEW_RING } from "./constants";
import { previewRing, previewRingBar, previewRingRest } from "./styles";
import type { PreviewRingProps } from "./types";

export function PreviewRing({ status, fraction, tone }: PreviewRingProps) {
  const shown = status === "loading" ? PREVIEW_RING.LOADING_ARC : fraction;

  return (
    <svg className={previewRing()} viewBox={PREVIEW_RING.VIEW_BOX} aria-hidden>
      {status === "playing" ? (
        <circle
          className={previewRingRest({ tone })}
          cx={PREVIEW_RING.CENTER}
          cy={PREVIEW_RING.CENTER}
          r={PREVIEW_RING.RADIUS}
        />
      ) : null}
      <circle
        className={previewRingBar({ status })}
        cx={PREVIEW_RING.CENTER}
        cy={PREVIEW_RING.CENTER}
        r={PREVIEW_RING.RADIUS}
        strokeDasharray={PREVIEW_RING.CIRCUMFERENCE}
        strokeDashoffset={PREVIEW_RING.CIRCUMFERENCE * (1 - shown)}
      />
    </svg>
  );
}
