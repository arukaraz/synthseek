"use client";

import { PreviewButton, PreviewTime } from "@components/ui/PreviewButton";
import { catalogPreviewClip, useTrackPreview } from "@hooks/ui/trackPreview";

import { cardPreviewEdge, cardPreviewSlot, cardPreviewTime } from "../styles";
import type { CardPreviewProps } from "./types";

export function CardPreview({ trackId, title, available }: CardPreviewProps) {
  const preview = useTrackPreview(catalogPreviewClip(trackId, title));

  return (
    <>
      {preview.active ? <div className={cardPreviewEdge()} data-cy="preview-edge" /> : null}
      <div className={cardPreviewSlot()}>
        {preview.clock ? (
          <span className={cardPreviewTime()}>
            <PreviewTime clock={preview.clock} />
          </span>
        ) : null}
        <PreviewButton
          title={title}
          status={preview.status}
          clock={preview.clock}
          available={available}
          onToggle={preview.toggle}
          tone="overlay"
        />
      </div>
    </>
  );
}
