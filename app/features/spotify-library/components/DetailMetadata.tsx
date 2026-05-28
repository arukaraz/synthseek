"use client";

import { formatLastSync } from "../helpers";
import {
  detailSection,
  detailSectionTitle,
  detailSectionTitleLine,
  metaGrid,
  metaKey,
  metaVal,
  metaValText,
} from "../styles";
import type { DetailMetadataProps } from "./types";

export function DetailMetadata({ sourceId, released, label, lastSyncedAt }: DetailMetadataProps) {
  return (
    <div className={detailSection()}>
      <h3 className={detailSectionTitle()}>
        Details <span className={detailSectionTitleLine()} />
      </h3>
      <div className={metaGrid()}>
        <div className={metaKey()}>Source ID</div>
        <div className={metaVal()}>{sourceId}</div>
        {released && (
          <>
            <div className={metaKey()}>Released</div>
            <div className={metaVal()}>{released}</div>
          </>
        )}
        {label && (
          <>
            <div className={metaKey()}>Label</div>
            <div className={metaValText()}>{label}</div>
          </>
        )}
        <div className={metaKey()}>Last sync</div>
        <div className={metaVal()}>{formatLastSync(lastSyncedAt)}</div>
      </div>
    </div>
  );
}
