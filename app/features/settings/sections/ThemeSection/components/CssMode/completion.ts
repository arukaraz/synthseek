import { autocompletion, pickedCompletion } from "@codemirror/autocomplete";
import type { Completion, CompletionSource } from "@codemirror/autocomplete";
import type { Extension } from "@codemirror/state";

import { THEME_CONTRACT } from "@theme/contract";

import {
  COMPLETION_DELAY_MS,
  COMPLETION_LOOKBEHIND,
  COMPLETION_MIN_WORD,
  CUSTOM_PROPERTY_PREFIX,
  PART_CONTEXT_PREFIXES,
  SNIPPETS,
  VAR_CONTEXT_PREFIX,
} from "./constants";
import { cursorIn, labelOf } from "./helpers";
import type { CompletionContextInfo, CompletionLists, ThemeCopy } from "./types";

function isWordCharacter(character: string): boolean {
  return (
    (character >= "a" && character <= "z") ||
    (character >= "A" && character <= "Z") ||
    (character >= "0" && character <= "9") ||
    character === "-" ||
    character === "_"
  );
}

export function isWordText(text: string): boolean {
  return Array.from(text).every(isWordCharacter);
}

export function trailingWord(before: string): string {
  let start = before.length;
  while (start > 0 && isWordCharacter(before.charAt(start - 1))) start -= 1;
  return before.slice(start);
}

export function completionContextOf(before: string, explicit: boolean): CompletionContextInfo | null {
  const word = trailingWord(before);
  const rest = before.slice(0, before.length - word.length);
  if (PART_CONTEXT_PREFIXES.some((prefix) => rest.endsWith(prefix))) return { kind: "part", word };
  if (rest.trimEnd().endsWith(VAR_CONTEXT_PREFIX)) return { kind: "token", word };
  if (word.startsWith(CUSTOM_PROPERTY_PREFIX)) return { kind: "token", word };
  if (word.length >= COMPLETION_MIN_WORD || explicit) return { kind: "general", word };
  return null;
}

function snippetOption(id: string, name: string, body: string, copy: ThemeCopy): Completion {
  const description = Object.hasOwn(copy.snippets, id) ? copy.snippets[id] : id;
  return {
    label: name,
    detail: description,
    type: "snippet",
    apply: (view, completion, from, to) => {
      view.dispatch({
        changes: { from, to, insert: body },
        selection: { anchor: from + cursorIn(body) },
        annotations: pickedCompletion.of(completion),
        scrollIntoView: true,
        userEvent: "input.complete",
      });
    },
  };
}

export function buildCompletionLists(copy: ThemeCopy): CompletionLists {
  const tokenOf = new WeakMap<Completion, string>();
  const colorTokens = new Set<string>();
  const byName: Completion[] = [];
  const byLabel: Completion[] = [];
  for (const token of THEME_CONTRACT.tokens) {
    const label = labelOf(copy, token.name);
    if (token.kind === "color") colorTokens.add(token.name);
    const named: Completion = { label: token.name, detail: label, type: "token", apply: token.name };
    const labelled: Completion = { label, detail: token.name, type: "token", apply: `var(${token.name})` };
    tokenOf.set(named, token.name);
    tokenOf.set(labelled, token.name);
    byName.push(named);
    byLabel.push(labelled);
  }
  const parts: Completion[] = THEME_CONTRACT.parts.map((part) => ({
    label: part.name,
    detail: Object.hasOwn(copy.parts, part.name) ? copy.parts[part.name] : "",
    type: "part",
    apply: part.name,
  }));
  const snippets = SNIPPETS.map((snippet) => snippetOption(snippet.id, snippet.name, snippet.body, copy));
  return { byName, general: [...snippets, ...byLabel], parts, colorTokens, tokenOf };
}

export function completionSourceOf(lists: CompletionLists): CompletionSource {
  return (context) => {
    const start = Math.max(0, context.pos - COMPLETION_LOOKBEHIND);
    const before = context.state.doc.sliceString(start, context.pos);
    const found = completionContextOf(before, context.explicit);
    if (found === null) return null;
    const options = found.kind === "part" ? lists.parts : found.kind === "token" ? lists.byName : lists.general;
    return { from: context.pos - found.word.length, options, validFor: isWordText };
  };
}

function swatchElement(lists: CompletionLists, completion: Completion, value: string | null): HTMLElement {
  const swatch = document.createElement("span");
  const name = lists.tokenOf.get(completion);
  if (name !== undefined && value !== null && lists.colorTokens.has(name)) {
    swatch.className = "cm-theme-swatch";
    swatch.style.background = value;
  } else {
    swatch.className = "cm-theme-swatch cm-theme-swatch-empty";
  }
  return swatch;
}

export function completionExtension(lists: CompletionLists, readValue: (name: string) => string | null): Extension {
  return autocompletion({
    override: [completionSourceOf(lists)],
    activateOnTypingDelay: COMPLETION_DELAY_MS,
    icons: false,
    addToOptions: [
      {
        position: 20,
        render: (completion) => {
          const name = lists.tokenOf.get(completion);
          return swatchElement(lists, completion, name === undefined ? null : readValue(name));
        },
      },
    ],
  });
}
