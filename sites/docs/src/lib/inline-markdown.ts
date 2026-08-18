export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string };

const BOLD_DELIMITER = "**";

export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer.length > 0) {
      tokens.push({ type: "text", value: buffer });
      buffer = "";
    }
  };

  while (i < text.length) {
    if (text.startsWith(BOLD_DELIMITER, i)) {
      const end = text.indexOf(BOLD_DELIMITER, i + BOLD_DELIMITER.length);
      if (end !== -1) {
        flush();
        tokens.push({ type: "bold", value: text.slice(i + BOLD_DELIMITER.length, end) });
        i = end + BOLD_DELIMITER.length;
        continue;
      }
    }

    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        tokens.push({ type: "code", value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          flush();
          tokens.push({
            type: "link",
            value: text.slice(i + 1, closeBracket),
            href: text.slice(closeBracket + 2, closeParen),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }

    buffer += text[i];
    i += 1;
  }

  flush();
  return tokens;
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/[\s]+/g, " ");
}
