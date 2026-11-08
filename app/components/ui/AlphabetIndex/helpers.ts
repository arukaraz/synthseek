import type { AlphabetIndexEntry, AlphabetIndexSlot } from "./types";

export function alphabetIndexSlots(
  entries: readonly AlphabetIndexEntry[],
  letters: readonly string[],
  descending: boolean
): AlphabetIndexSlot[] {
  const byLetter = new Map(entries.map((entry) => [entry.letter, entry]));
  const ordered = descending ? [...letters].reverse() : letters;
  const slots = ordered.map((letter) => ({ letter, target: byLetter.get(letter) ?? null }));
  return slots.map((slot, index) => ({
    letter: slot.letter,
    target: slot.target ?? slots.slice(index + 1).find((next) => next.target)?.target ?? null,
  }));
}

export function slotIndexAt(clientY: number, rect: DOMRect, count: number): number {
  const ratio = (clientY - rect.top) / Math.max(1, rect.height);
  return Math.min(count - 1, Math.max(0, Math.floor(ratio * count)));
}
