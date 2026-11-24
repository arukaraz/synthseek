"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { formatStat } from "../../helpers";
import { statCell, statLabel, statRow, statValue } from "../../styles";
import { figureLabelKey } from "./helpers";
import { SourceFigure } from "./SourceFigure";
import type { FigureKind, SourceFiguresProps } from "./types";

export function SourceFigures({ groups, plain }: SourceFiguresProps) {
  const { t } = useTranslation("contentDetail");
  const [openKind, setOpenKind] = useState<FigureKind | null>(null);

  return (
    <div className={statRow({ layout: "aside" })}>
      {groups.map((group) => {
        const [lead] = group.entries;
        return (
          <div key={group.kind} className={statCell({ layout: "aside" })}>
            {lead ? (
              <SourceFigure
                group={group}
                lead={lead}
                open={openKind === group.kind}
                onOpenChange={(next) => setOpenKind(next ? group.kind : null)}
              />
            ) : (
              <>
                <span className={statValue({ layout: "aside" })}>{formatStat(null)}</span>
                <span className={statLabel({ layout: "aside" })}>{t(figureLabelKey(group.kind, undefined))}</span>
              </>
            )}
          </div>
        );
      })}
      <div className={statCell({ layout: "aside" })}>
        <span className={statValue({ layout: "aside" })}>{formatStat(plain.value)}</span>
        <span className={statLabel({ layout: "aside" })}>{plain.label}</span>
      </div>
    </div>
  );
}
