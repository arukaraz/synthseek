"use client";

import { cn } from "@utils/cn";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { SourceBadge } from "@components/SourceBadge";

import { bioClamped, bioSource, bioSourceLink, bioText, bioToggle } from "../../styles";
import { ABOUT_BIO_EXPAND_THRESHOLD } from "./constants";
import type { AboutBioProps } from "./types";

export function AboutBio({ text, clamped = true, source }: AboutBioProps) {
  const { t } = useTranslation("contentDetail");
  const [expanded, setExpanded] = useState(false);

  if (!text || text.trim().length === 0) return null;

  const isExpandable = clamped && text.length > ABOUT_BIO_EXPAND_THRESHOLD;
  const isClamped = clamped && !expanded;

  return (
    <div>
      <p className={cn(bioText(), isClamped && bioClamped())}>{text}</p>
      {isExpandable ? (
        <button type="button" className={bioToggle()} onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? t("bio.less") : t("bio.more")}
        </button>
      ) : null}
      {source ? (
        <p className={bioSource()}>
          <a
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className={bioSourceLink()}
            aria-label={t("bio.readOn", { source: source.label })}
          >
            <SourceBadge source={source.source} label={source.label} />
          </a>
        </p>
      ) : null}
    </div>
  );
}
