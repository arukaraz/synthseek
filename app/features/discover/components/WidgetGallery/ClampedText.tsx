"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useElementWidth } from "@hooks/ui/useElementWidth";
import { cn } from "@utils/cn";

import { clampedBlock, clampedBody, clampedToggle } from "./styles";
import type { ClampedTextProps } from "./types";

export function ClampedText({ text, className }: ClampedTextProps) {
  const { t } = useTranslation("discover");
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [measure, width] = useElementWidth<HTMLParagraphElement>();
  const nodeRef = useRef<HTMLParagraphElement | null>(null);
  const attach = useCallback(
    (node: HTMLParagraphElement | null) => {
      nodeRef.current = node;
      measure(node);
    },
    [measure]
  );

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (node && !expanded) setOverflowing(node.scrollHeight > node.clientHeight);
  }, [expanded, text, width]);

  return (
    <div className={clampedBlock()}>
      <p ref={attach} className={cn(clampedBody({ expanded }), className)}>
        {text}
      </p>
      {overflowing ? (
        <button
          type="button"
          className={clampedToggle()}
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? t("board.gallery.seeLess") : t("board.gallery.seeMore")}
        </button>
      ) : null}
    </div>
  );
}
