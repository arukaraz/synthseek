"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { fractionOf, useCopyComparison } from "@hooks/ui/copyComparison";

import { dupBody, dupFooter, dupLoopBand, dupPlayhead, dupPlayheadLayer, dupRuler, dupTimeline } from "../../styles";
import { ComparatorTransport } from "./ComparatorTransport";
import { CopyLane } from "./CopyLane";
import { SEEK_STEP_SECONDS } from "./constants";
import { clockLabel, comparedCopiesOf, positionAtPointer, rulerTicks, spansLibraryPaths } from "./helpers";
import { atStyle, spanStyle } from "./styles";
import type { DuplicateComparatorProps } from "./types";

export function DuplicateComparator({ group, busy, onKeep, onNoneFits }: DuplicateComparatorProps) {
  const { t } = useTranslation("settings");
  const compared = useMemo(() => comparedCopiesOf(group), [group]);
  const comparison = useCopyComparison(compared);
  const reference = group.copies[0]?.id;
  const showPath = spansLibraryPaths(group);

  return (
    <div className={dupBody()}>
      <ComparatorTransport comparison={comparison} />
      <div className={dupTimeline()}>
        <div
          className={dupRuler()}
          role="slider"
          tabIndex={0}
          aria-label={t("libraryScan.duplicates.position")}
          aria-valuemin={Math.round(comparison.bounds.start)}
          aria-valuemax={Math.round(comparison.bounds.end)}
          aria-valuenow={Math.round(comparison.position)}
          aria-valuetext={clockLabel(comparison.position)}
          onPointerDown={(event) =>
            comparison.seek(
              positionAtPointer(event.clientX, event.currentTarget.getBoundingClientRect(), comparison.bounds)
            )
          }
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") comparison.seek(comparison.position + SEEK_STEP_SECONDS);
            if (event.key === "ArrowLeft") comparison.seek(comparison.position - SEEK_STEP_SECONDS);
          }}
        >
          {rulerTicks(comparison.bounds).map((tick) => (
            <span key={tick}>{clockLabel(tick)}</span>
          ))}
        </div>
        {group.copies.map((copy, index) => (
          <CopyLane
            key={copy.id}
            copy={copy}
            index={index}
            comparison={comparison}
            compared={compared[index]}
            isReference={copy.id === reference}
            showPath={showPath}
            busy={busy}
            onKeep={() => {
              comparison.stop();
              onKeep(copy);
            }}
          />
        ))}
        <div className={dupPlayheadLayer()} aria-hidden>
          {comparison.loop === null ? null : (
            <div
              className={dupLoopBand()}
              style={spanStyle(
                fractionOf(comparison.loop.start, comparison.bounds),
                fractionOf(comparison.loop.end, comparison.bounds) -
                  fractionOf(comparison.loop.start, comparison.bounds)
              )}
            />
          )}
          <div className={dupPlayhead()} style={atStyle(fractionOf(comparison.position, comparison.bounds))} />
        </div>
      </div>
      <div className={dupFooter()}>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive-vivid"
          disabled={busy}
          onClick={() => {
            comparison.stop();
            onNoneFits();
          }}
        >
          {t("libraryScan.duplicates.noneFits")}
        </Button>
      </div>
    </div>
  );
}
