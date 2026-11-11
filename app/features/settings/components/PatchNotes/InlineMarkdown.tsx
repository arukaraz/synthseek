import { Fragment } from "react";

import { normalizeWhitespace, tokenizeInline } from "./helpers";
import { inlineCode, inlineLink } from "./styles";
import type { InlineMarkdownProps } from "./types";

export function InlineMarkdown({ text }: InlineMarkdownProps) {
  const tokens = tokenizeInline(text);

  return (
    <>
      {tokens.map((token, index) => {
        const key = `${index}-${token.type}`;
        if (token.type === "bold") {
          return (
            <strong key={key} className="text-fg/90 font-semibold">
              {normalizeWhitespace(token.value)}
            </strong>
          );
        }
        if (token.type === "code") {
          return (
            <code key={key} className={inlineCode()}>
              {token.value}
            </code>
          );
        }
        if (token.type === "link") {
          return (
            <a key={key} href={token.href} target="_blank" rel="noopener noreferrer" className={inlineLink()}>
              {normalizeWhitespace(token.value)}
            </a>
          );
        }
        return <Fragment key={key}>{normalizeWhitespace(token.value)}</Fragment>;
      })}
    </>
  );
}
