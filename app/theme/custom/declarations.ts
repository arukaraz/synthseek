import type { TokenDeclaration } from "./types";

const ROOT_SELECTOR = ":root";
const INDENT = "  ";

interface RootBlock {
  open: number;
  close: number;
  danglingEnd: number;
}

interface Analysis {
  declarations: TokenDeclaration[];
  roots: RootBlock[];
}

function isSpace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r" || char === "\f";
}

function skipComment(css: string, index: number): number {
  if (css[index] !== "/" || css[index + 1] !== "*") return index;
  const end = css.indexOf("*/", index + 2);
  return end === -1 ? css.length : end + 2;
}

function skipString(css: string, index: number): number {
  const quote = css[index];
  let cursor = index + 1;
  while (cursor < css.length) {
    if (css[cursor] === "\\") cursor += 2;
    else if (css[cursor] === quote) return cursor + 1;
    else cursor += 1;
  }
  return css.length;
}

function skipSpace(css: string, index: number): number {
  let cursor = index;
  while (cursor < css.length) {
    if (isSpace(css[cursor])) cursor += 1;
    else {
      const next = skipComment(css, cursor);
      if (next === cursor) return cursor;
      cursor = next;
    }
  }
  return cursor;
}

function skipBlock(css: string, from: number): number {
  let depth = 1;
  let cursor = from;
  while (cursor < css.length) {
    const char = css[cursor];
    const afterComment = skipComment(css, cursor);
    if (afterComment !== cursor) cursor = afterComment;
    else if (char === '"' || char === "'") cursor = skipString(css, cursor);
    else {
      cursor += 1;
      if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) return cursor;
      }
    }
  }
  return css.length;
}

function declarationOf(css: string, start: number, end: number): TokenDeclaration | null {
  let cursor = start;
  while (cursor < end && !isSpace(css[cursor]) && css[cursor] !== ":") cursor += 1;
  const name = css.slice(start, cursor);
  if (!name.startsWith("--") || name.length === 2) return null;
  cursor = skipSpace(css, cursor);
  if (cursor >= end || css[cursor] !== ":") return null;
  cursor += 1;
  while (cursor < end && isSpace(css[cursor])) cursor += 1;
  const valueStart = cursor;
  let valueEnd = end;
  while (valueEnd > valueStart && isSpace(css[valueEnd - 1])) valueEnd -= 1;
  return { name, value: css.slice(valueStart, valueEnd), valueStart, valueEnd };
}

interface Statement {
  next: number;
  dangling: number;
}

function readStatement(css: string, start: number, declarations: TokenDeclaration[]): Statement {
  let cursor = start;
  while (cursor < css.length) {
    const char = css[cursor];
    const afterComment = skipComment(css, cursor);
    if (afterComment !== cursor) cursor = afterComment;
    else if (char === '"' || char === "'") cursor = skipString(css, cursor);
    else if (char === "{") return { next: skipBlock(css, cursor + 1), dangling: -1 };
    else if (char === ";" || char === "}") break;
    else cursor += 1;
  }
  const end = Math.min(cursor, css.length);
  const declaration = declarationOf(css, start, end);
  if (declaration) declarations.push(declaration);
  if (css[end] === ";") return { next: end + 1, dangling: -1 };
  let trimmed = end;
  while (trimmed > start && isSpace(css[trimmed - 1])) trimmed -= 1;
  return { next: end, dangling: trimmed };
}

function readRoot(css: string, from: number, declarations: TokenDeclaration[]): { close: number; dangling: number } {
  let cursor = from;
  let dangling = -1;
  while (true) {
    cursor = skipSpace(css, cursor);
    if (cursor >= css.length) return { close: css.length, dangling };
    if (css[cursor] === "}") return { close: cursor, dangling };
    if (css[cursor] === ";") {
      cursor += 1;
      continue;
    }
    const statement = readStatement(css, cursor, declarations);
    dangling = statement.dangling;
    cursor = statement.next;
  }
}

function analyze(css: string): Analysis {
  const declarations: TokenDeclaration[] = [];
  const roots: RootBlock[] = [];
  let selector = "";
  let cursor = 0;
  while (cursor < css.length) {
    const char = css[cursor];
    const afterComment = skipComment(css, cursor);
    if (afterComment !== cursor) {
      cursor = afterComment;
    } else if (char === '"' || char === "'") {
      const end = skipString(css, cursor);
      selector += css.slice(cursor, end);
      cursor = end;
    } else if (char === ";" || char === "}") {
      selector = "";
      cursor += 1;
    } else if (char === "{") {
      if (selector.trim() === ROOT_SELECTOR) {
        const root = readRoot(css, cursor + 1, declarations);
        roots.push({ open: cursor, close: root.close, danglingEnd: root.dangling });
        cursor = Math.min(root.close + 1, css.length);
      } else {
        cursor = skipBlock(css, cursor + 1);
      }
      selector = "";
    } else {
      selector += char;
      cursor += 1;
    }
  }
  return { declarations, roots };
}

export function scanDeclarations(css: string): TokenDeclaration[] {
  return analyze(css).declarations;
}

export function valuesOf(css: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const declaration of scanDeclarations(css)) values.set(declaration.name, declaration.value);
  return values;
}

function breaksDeclaration(value: string): boolean {
  for (const char of [";", "{", "}", "\n", "\r", "/*"]) {
    if (value.includes(char)) return true;
  }
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '"' || char === "'") {
      const end = skipString(value, index);
      if (value[end - 1] !== char || end - index < 2) return true;
      index = end - 1;
    }
  }
  return false;
}

function insertAt(css: string, index: number, text: string): string {
  return css.slice(0, index) + text + css.slice(index);
}

export function setDeclaration(css: string, name: string, value: string): string {
  if (!name.startsWith("--") || name.length === 2 || breaksDeclaration(value)) return css;
  const { declarations, roots } = analyze(css);
  for (let index = declarations.length - 1; index >= 0; index -= 1) {
    const declaration = declarations[index];
    if (declaration.name === name) {
      return css.slice(0, declaration.valueStart) + value + css.slice(declaration.valueEnd);
    }
  }
  const line = `${INDENT}${name}: ${value};`;
  const root = roots[roots.length - 1];
  if (!root) {
    const lead = css === "" || css.endsWith("\n") ? "" : "\n";
    return `${css}${lead}${ROOT_SELECTOR} {\n${line}\n}\n`;
  }
  let text = css;
  let close = root.close;
  if (root.danglingEnd >= 0) {
    text = insertAt(text, root.danglingEnd, ";");
    close += 1;
  }
  if (close >= text.length) {
    const lead = text.endsWith("\n") ? "" : "\n";
    return `${text}${lead}${line}\n}`;
  }
  let lineStart = close;
  while (lineStart > 0 && (text[lineStart - 1] === " " || text[lineStart - 1] === "\t")) lineStart -= 1;
  if (lineStart > 0 && text[lineStart - 1] === "\n") return insertAt(text, lineStart, `${line}\n`);
  return insertAt(text, close, `\n${line}\n`);
}
