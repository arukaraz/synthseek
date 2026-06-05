import type { ChangelogSection, EntryVariant, InlineToken, NoteLine } from "./types";

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
  let result = "";
  let prevSpace = false;
  for (const char of text) {
    const isSpace = char === " " || char === "\n" || char === "\t" || char === "\r";
    if (isSpace) {
      if (!prevSpace) {
        result += " ";
      }
      prevSpace = true;
    } else {
      result += char;
      prevSpace = false;
    }
  }
  return result;
}

function parseSemverParts(version: string): number[] {
  return version.split(".").map((part) => {
    const parsed = Number.parseInt(part, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  });
}

export function compareSemver(a: string, b: string): number {
  const left = parseSemverParts(a);
  const right = parseSemverParts(b);
  for (let i = 0; i < 3; i += 1) {
    const da = left[i] ?? 0;
    const db = right[i] ?? 0;
    if (da !== db) {
      return da > db ? 1 : -1;
    }
  }
  return 0;
}

export function entryVariant(version: string, currentVersion: string | null, isNewest: boolean): EntryVariant {
  if (currentVersion && version === currentVersion) {
    return "current";
  }
  if (currentVersion && compareSemver(version, currentVersion) > 0) {
    return isNewest ? "latest" : "new";
  }
  if (!currentVersion && isNewest) {
    return "latest";
  }
  return "past";
}

export function deriveNotes(sections: ChangelogSection[]): NoteLine[] {
  const notes: NoteLine[] = [];
  for (const section of sections) {
    if (section.items && section.items.length > 0) {
      for (const item of section.items) {
        notes.push({ category: section.category, text: item });
      }
    } else if (section.body) {
      notes.push({ category: section.category, text: section.body });
    }
  }
  return notes;
}

export function formatEntryDate(dateString: string, locale: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}
