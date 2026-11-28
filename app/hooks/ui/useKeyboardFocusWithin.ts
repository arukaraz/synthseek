"use client";

import { useEffect, useState } from "react";

function isWithin(node: EventTarget | null, selector: string): boolean {
  return node instanceof Element && node.closest(selector) !== null;
}

export function useKeyboardFocusWithin(selector: string): boolean {
  const [inside, setInside] = useState(false);

  useEffect(() => {
    let keyboard = false;
    const keyed = () => {
      keyboard = true;
    };
    const pointed = () => {
      keyboard = false;
    };
    const entered = (event: FocusEvent) => setInside(keyboard && isWithin(event.target, selector));
    const left = (event: FocusEvent) => {
      const next = event.relatedTarget;
      setInside((current) => current && isWithin(next, selector));
    };
    document.addEventListener("keydown", keyed, true);
    document.addEventListener("pointerdown", pointed, true);
    document.addEventListener("focusin", entered);
    document.addEventListener("focusout", left);
    return () => {
      document.removeEventListener("keydown", keyed, true);
      document.removeEventListener("pointerdown", pointed, true);
      document.removeEventListener("focusin", entered);
      document.removeEventListener("focusout", left);
    };
  }, [selector]);

  return inside;
}
