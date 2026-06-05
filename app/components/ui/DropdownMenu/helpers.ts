import type { PointerEvent as ReactPointerEvent, PointerEventHandler } from "react";

export function composePointerHandlers(
  original: PointerEventHandler | undefined,
  ours: PointerEventHandler
): PointerEventHandler {
  return (event: ReactPointerEvent) => {
    original?.(event);
    if (!event.defaultPrevented) ours(event);
  };
}
