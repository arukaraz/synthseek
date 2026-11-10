import type { MouseEvent } from "react";

export function isolated(action: () => void) {
  return (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };
}
