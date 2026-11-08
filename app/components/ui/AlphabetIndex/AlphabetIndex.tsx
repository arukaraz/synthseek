"use client";

import { cn } from "@utils/cn";
import { type PointerEvent, useMemo, useRef, useState } from "react";

import { ALPHABET_INDEX_HAPTIC_MS } from "./constants";
import { alphabetIndexSlots, slotIndexAt } from "./helpers";
import { alphabetIndexBubble, alphabetIndexLetter, alphabetIndexRoot, alphabetIndexStrip } from "./styles";
import type { AlphabetIndexProps, AlphabetIndexScrub } from "./types";

export function AlphabetIndex({
  entries,
  descending = false,
  label,
  letterLabel,
  onSelect,
  className,
}: AlphabetIndexProps) {
  const slots = useMemo(() => alphabetIndexSlots(entries, descending), [entries, descending]);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const scrubbingRef = useRef(false);
  const lastLetterRef = useRef<string | null>(null);
  const [scrub, setScrub] = useState<AlphabetIndexScrub | null>(null);

  const pick = (event: PointerEvent<HTMLElement>) => {
    const strip = stripRef.current;
    if (!strip) return;
    const slot = slots[slotIndexAt(event.clientY, strip.getBoundingClientRect(), slots.length)];
    if (!slot) return;
    setScrub({ letter: slot.letter, y: event.clientY - event.currentTarget.getBoundingClientRect().top });
    if (lastLetterRef.current === slot.letter) return;
    lastLetterRef.current = slot.letter;
    if (!slot.target) return;
    navigator.vibrate?.(ALPHABET_INDEX_HAPTIC_MS);
    onSelect(slot.target);
  };

  const end = () => {
    scrubbingRef.current = false;
    lastLetterRef.current = null;
    setScrub(null);
  };

  return (
    <nav
      aria-label={label}
      className={cn(alphabetIndexRoot(), className)}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        scrubbingRef.current = true;
        pick(event);
      }}
      onPointerMove={(event) => {
        if (scrubbingRef.current) pick(event);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <div ref={stripRef} className={alphabetIndexStrip()}>
        {slots.map((slot) => {
          const available = entries.some((entry) => entry.letter === slot.letter);
          return (
            <button
              key={slot.letter}
              type="button"
              disabled={!available}
              aria-label={letterLabel(slot.letter)}
              className={alphabetIndexLetter({
                state: scrub?.letter === slot.letter ? "active" : available ? "idle" : "empty",
              })}
              onClick={(event) => {
                if (event.detail === 0 && slot.target) onSelect(slot.target);
              }}
            >
              {slot.letter}
            </button>
          );
        })}
      </div>
      {scrub ? (
        <span aria-hidden className={alphabetIndexBubble()} style={{ top: scrub.y }}>
          {scrub.letter}
        </span>
      ) : null}
    </nav>
  );
}
