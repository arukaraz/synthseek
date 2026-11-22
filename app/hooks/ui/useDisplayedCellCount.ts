"use client";

import { useEffect, useState } from "react";

function countDisplayed(row: HTMLElement): number {
  return Array.from(row.children).filter((cell) => getComputedStyle(cell).display !== "none").length;
}

export function useDisplayedCellCount<T extends HTMLElement>(): [(node: T | null) => void, number | null] {
  const [node, setNode] = useState<T | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (node === null) return;
    const recount = () => setCount(countDisplayed(node));
    recount();
    const resizes = new ResizeObserver(recount);
    resizes.observe(node);
    const cells = new MutationObserver(recount);
    cells.observe(node, { childList: true });
    return () => {
      resizes.disconnect();
      cells.disconnect();
    };
  }, [node]);

  return [setNode, node === null ? null : count];
}
