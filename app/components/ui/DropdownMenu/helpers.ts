import type { PointerEvent as ReactPointerEvent, PointerEventHandler } from "react";

export function skipKeyboardPress(original: PointerEventHandler | undefined): PointerEventHandler {
  return (event: ReactPointerEvent) => {
    original?.(event);
    const pointer: string = event.pointerType;
    if (pointer === "") event.preventDefault();
  };
}

export function composePointerHandlers(
  original: PointerEventHandler | undefined,
  ours: PointerEventHandler
): PointerEventHandler {
  return (event: ReactPointerEvent) => {
    original?.(event);
    if (!event.defaultPrevented) ours(event);
  };
}
