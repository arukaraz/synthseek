"use client";

import { highlightParts } from "./helpers";
import { searchMatch } from "./styles";
import type { HighlightedTextProps } from "./types";

export function HighlightedText({ text, query }: HighlightedTextProps) {
  return (
    <>
      {highlightParts(text, query).map((part, index) =>
        part.match ? (
          <mark key={index} className={searchMatch()}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}
