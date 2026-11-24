"use client";

import { ChevronDown } from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { SourceBadge } from "@components/SourceBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { cn } from "@utils/cn";

import { formatStat } from "../../helpers";
import { statValue } from "../../styles";
import { FIGURE_PANEL_EDGE_PX, FIGURE_PANEL_OFFSET_PX } from "./constants";
import { bySourceKey, figureLabelKey } from "./helpers";
import {
  figureButton,
  figureChevron,
  figureLabel,
  figurePanel,
  figurePanelTitle,
  figureRows,
  figureRowUnit,
  figureRowValue,
} from "./styles";
import type { SourceFigureProps } from "./types";

export function SourceFigure({ group, lead, open, onOpenChange }: SourceFigureProps) {
  const { t } = useTranslation("contentDetail");
  const title = t(bySourceKey(group.kind));

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("group", figureButton())} data-figure={group.kind}>
          <span className={statValue({ layout: "aside" })}>{formatStat(lead.value)}</span>
          <span className={figureLabel()}>
            {t(figureLabelKey(group.kind, lead))}
            <ChevronDown className={figureChevron()} aria-hidden />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={FIGURE_PANEL_OFFSET_PX}
        collisionPadding={FIGURE_PANEL_EDGE_PX}
        className={figurePanel()}
        role="group"
        aria-label={title}
      >
        <p className={figurePanelTitle()}>{title}</p>
        <div className={figureRows()}>
          {group.entries.map((entry) => (
            <Fragment key={entry.source}>
              <span>
                <SourceBadge source={entry.source} label={entry.name} />
              </span>
              <span className={figureRowValue()}>
                {entry.fans ? <small className={figureRowUnit()}>{t("stats.fansUnit")}</small> : null}
                {formatStat(entry.value)}
              </span>
            </Fragment>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
