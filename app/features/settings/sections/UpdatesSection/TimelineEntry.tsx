"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@utils/cn";

import { EntryBody } from "./EntryBody";
import { formatEntryDate } from "./helpers";
import {
  badge,
  card,
  cardTopPast,
  date,
  entry as entryStyle,
  expandButton,
  expandIcon,
  headline,
  node,
  nodeCheck,
  nodePing,
  pastBody,
  version,
  vRow,
  vRowPast,
  youHereAbs,
  youHereInline,
} from "./styles";
import type { TimelineEntryProps } from "./types";

export function TimelineEntry({ entry, variant }: TimelineEntryProps) {
  const { t, i18n } = useTranslation("settings");
  const [open, setOpen] = useState(false);
  const formattedDate = formatEntryDate(entry.date, i18n.language);
  const versionTag = t("updates.versionTag", { version: entry.version });

  if (variant === "past") {
    return (
      <div className={entryStyle()}>
        <div className={node({ variant: "past" })} />
        <div className={card({ variant: "past" })}>
          <div className={cardTopPast()}>
            <div>
              <div className={vRowPast()}>
                <span className={version({ variant: "past" })}>{versionTag}</span>
                <span className={date()}>{formattedDate}</span>
              </div>
              <div className={headline({ variant: "past" })}>{entry.title}</div>
            </div>
            <button
              type="button"
              className={expandButton()}
              aria-expanded={open}
              aria-label={open ? t("updates.notes.collapse") : t("updates.notes.expand")}
              onClick={() => setOpen((value) => !value)}
            >
              <ChevronDown className={cn(expandIcon(), open && "rotate-180")} />
            </button>
          </div>
          {open ? (
            <div className={pastBody()}>
              <EntryBody entry={entry} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const isNewish = variant === "latest" || variant === "new";

  return (
    <div className={entryStyle()}>
      {variant === "current" ? <span className={youHereAbs()}>{t("updates.youAreHere")}</span> : null}
      <div className={node({ variant })}>
        {variant === "latest" ? <span className={nodePing()} /> : null}
        {variant === "current" ? <Check className={nodeCheck()} /> : null}
      </div>
      <div className={card({ variant })}>
        <div className={vRow()}>
          <span className={version({ variant })}>{versionTag}</span>
          {isNewish ? <span className={badge({ tone: "new" })}>{t("updates.badge.new")}</span> : null}
          {variant === "current" ? (
            <span className={badge({ tone: "current" })}>{t("updates.badge.current")}</span>
          ) : null}
          {variant === "current" ? <span className={youHereInline()}>{t("updates.youAreHere")}</span> : null}
          <span className={date()}>{formattedDate}</span>
        </div>
        <div className={headline({ variant })}>{entry.title}</div>
        <EntryBody entry={entry} />
      </div>
    </div>
  );
}
