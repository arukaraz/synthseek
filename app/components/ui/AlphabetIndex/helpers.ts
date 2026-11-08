import { ALPHABET_INDEX_LETTERS } from "./constants";
import type { AlphabetIndexEntry, AlphabetIndexSlot } from "./types";

export function alphabetIndexSlots(entries: readonly AlphabetIndexEntry[], descending: boolean): AlphabetIndexSlot[] {
  const byLetter = new Map(entries.map((entry) => [entry.letter, entry]));
  const letters = descending ? [...ALPHABET_INDEX_LETTERS].reverse() : ALPHABET_INDEX_LETTERS;
  const slots = letters.map((letter) => ({ letter, target: byLetter.get(letter) ?? null }));
  return slots.map((slot, index) => ({
    letter: slot.letter,
    target: slot.target ?? slots.slice(index + 1).find((next) => next.target)?.target ?? null,
  }));
}

export function slotIndexAt(clientY: number, rect: DOMRect, count: number): number {
  const ratio = (clientY - rect.top) / Math.max(1, rect.height);
  return Math.min(count - 1, Math.max(0, Math.floor(ratio * count)));
}
